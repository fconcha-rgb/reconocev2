"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { catalogItemSchema } from "@/lib/validations";

// Estas actions usan la sesión del admin: RLS (catalog_admin_write) es la
// autorización real. El middleware protege la ruta; la BD, los datos.

export async function createCatalogItemAction(formData: FormData) {
  const supabase = createClient();
  const stockRaw = formData.get("stock");
  const parsed = catalogItemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    type: formData.get("type"),
    pointsCost: formData.get("pointsCost"),
    stock: stockRaw ? Number(stockRaw) : null,
    isUnlimitedStock: !stockRaw,
    requiresApproval: formData.get("requiresApproval") === "true",
  });
  if (!parsed.success) return;

  const { data: userData } = await supabase.auth.getUser();
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", userData.user?.id)
    .single();

  await supabase.from("catalog_items").insert({
    organization_id: myProfile?.organization_id,
    name: parsed.data.name,
    description: parsed.data.description,
    type: parsed.data.type,
    points_cost: parsed.data.pointsCost,
    stock: parsed.data.stock,
    is_unlimited_stock: parsed.data.isUnlimitedStock,
    requires_approval: parsed.data.requiresApproval,
  });

  revalidatePath("/admin/catalogo");
  revalidatePath("/catalogo");
}

export async function toggleCatalogItemAction(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));
  const isActive = formData.get("isActive") === "true";
  await supabase.from("catalog_items").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/catalogo");
  revalidatePath("/catalogo");
}
