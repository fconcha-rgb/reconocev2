"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Estas actions dependen de RLS (policy pillars_admin_write) para la
// autorización real. La UI ya está protegida por middleware, pero la
// verdadera barrera de seguridad es la base de datos.

export async function createPillarAction(formData: FormData) {
  const supabase = createClient();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) return;

  const { data: profile } = await supabase.auth.getUser();
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", profile.user?.id)
    .single();

  await supabase.from("pillars").insert({
    organization_id: myProfile?.organization_id,
    name,
    description,
  });

  revalidatePath("/admin/pilares");
}

export async function togglePillarAction(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));
  const isActive = formData.get("isActive") === "true";
  await supabase.from("pillars").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/pilares");
}
