"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redemptionSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/recognitions";

const ERROR_MESSAGES: Record<string, string> = {
  profile_not_active: "Tu cuenta no está activa.",
  item_not_available: "Este producto ya no está disponible.",
  item_not_yet_valid: "Este producto todavía no está disponible.",
  item_expired: "Este producto ya no está vigente.",
  redemption_limit_reached: "Alcanzaste el límite de canjes para este producto.",
  insufficient_wallet_balance: "No tienes suficientes puntos en tu billetera.",
  out_of_stock: "Sin stock disponible.",
};

export async function redeemCatalogItemAction(
  input: unknown,
  idempotencyKey?: string
): Promise<ActionResult<{ id: string }>> {
  const parsed = redemptionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Selecciona un producto válido." };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("redeem_catalog_item", {
    p_catalog_item_id: parsed.data.catalogItemId,
    p_idempotency_key: idempotencyKey ?? randomUUID(),
  });

  if (error) {
    const code = error.message?.split(":")[0]?.trim() ?? "";
    return { ok: false, error: ERROR_MESSAGES[code] ?? "No se pudo procesar el canje." };
  }

  revalidatePath("/billetera");
  revalidatePath("/catalogo");
  return { ok: true, data: { id: data as string } };
}

export async function resolveRedemptionAction(
  redemptionId: string,
  newStatus: "approved" | "rejected" | "cancelled" | "processing" | "ready" | "delivered",
  reason: string
): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.rpc("resolve_redemption", {
    p_redemption_id: redemptionId,
    p_new_status: newStatus,
    p_reason: reason,
  });

  if (error) {
    return { ok: false, error: "No se pudo actualizar el canje." };
  }

  revalidatePath("/admin/catalogo");
  return { ok: true, data: undefined };
}
