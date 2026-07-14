"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recognitionSchema } from "@/lib/validations";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// Mapea los errores que lanza create_recognition() en Postgres a mensajes
// entendibles. La validación real e inquebrantable vive en la función SQL;
// esto es solo para dar buen feedback en la UI.
const ERROR_MESSAGES: Record<string, string> = {
  self_recognition_not_allowed: "No puedes reconocerte a ti mismo.",
  sender_not_active: "Tu cuenta no está activa.",
  receiver_invalid_or_inactive: "La persona seleccionada no está disponible.",
  pillar_invalid_or_inactive: "Selecciona un pilar válido.",
  period_closed_or_not_found: "El período de reconocimiento está cerrado.",
  amount_below_minimum: "El monto es menor al mínimo permitido.",
  message_required: "El mensaje es obligatorio.",
  insufficient_credit_balance: "No tienes suficientes créditos disponibles este mes.",
};

export async function createRecognitionAction(
  input: unknown,
  idempotencyKey?: string
): Promise<ActionResult<{ id: string }>> {
  const parsed = recognitionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("create_recognition", {
    p_receiver_id: parsed.data.receiverId,
    p_pillar_id: parsed.data.pillarId,
    p_amount: parsed.data.amount,
    p_message: parsed.data.message,
    // Idempotencia real: si no llega una key generada en el cliente
    // (protección doble-clic / doble pestaña), se genera una en servidor.
    p_idempotency_key: idempotencyKey ?? randomUUID(),
  });

  if (error) {
    const code = error.message?.split(":")[0]?.trim() ?? "";
    return { ok: false, error: ERROR_MESSAGES[code] ?? "No se pudo registrar el reconocimiento." };
  }

  revalidatePath("/feed");
  revalidatePath("/dashboard");
  return { ok: true, data: { id: data as string } };
}
