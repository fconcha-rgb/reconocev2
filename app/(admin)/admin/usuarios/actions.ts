"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleUserStatusAction(formData: FormData) {
  const supabase = createClient();
  const userId = String(formData.get("userId"));
  const status = String(formData.get("status"));
  await supabase.from("profiles").update({ status }).eq("id", userId);
  revalidatePath("/admin/usuarios");
}

export async function changeUserRoleAction(formData: FormData) {
  const supabase = createClient();
  const userId = String(formData.get("userId"));
  const role = String(formData.get("role"));
  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin/usuarios");
}
