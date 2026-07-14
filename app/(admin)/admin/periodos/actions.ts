"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { periodConfigSchema } from "@/lib/validations";

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
