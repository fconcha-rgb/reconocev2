"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { catalogItemSchema } from "@/lib/validations";

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
}
