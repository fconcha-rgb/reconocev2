"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { periodConfigSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/actions/admin";
import type { ActionResult } from "@/lib/actions/recognitions";

export async function updatePeriodConfigAction(formData: FormData) {
  const parsed = periodConfigSchema.safeParse({
    defaultCredits: formData.get("defaultCredits"),
    minRecognitionAmount: formData.get("minRecognitionAmount"),
  });
  if (!parsed.success) return;

  const supabase = createClient();
  const periodId = String(formData.get("periodId"));

  await supabase
    .from("periods")
    .update({
      default_credits: parsed.data.defaultCredits,
      min_recognition_amount: parsed.data.minRecognitionAmount,
    })
    .eq("id", periodId);

  revalidatePath("/admin/periodos");
}

// Abre (o reabre) el período del mes ACTUAL usando el mismo job idempotente
// del cron: crea el período si no existe y asigna créditos a todos los
// perfiles activos que aún no los tengan. Respaldo manual por si pg_cron
// no está configurado o falló.
export async function openCurrentPeriodAction(): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  const service = createServiceRoleClient();
  const { error } = await service.rpc("job_open_monthly_period", {
    p_request_id: `manual-admin-${Date.now()}`,
  });
  if (error) {
    return { ok: false, error: "No se pudo abrir el período. Revisa los logs de Supabase." };
  }

  revalidatePath("/admin/periodos");
  revalidatePath("/dashboard");
  revalidatePath("/reconocer");
  return { ok: true, data: undefined };
}
