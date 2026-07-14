import { createClient } from "@/lib/supabase/server";
import { createCatalogItemAction } from "./actions";
import { RedemptionActions } from "./redemption-actions";

export default async function AdminCatalogPage() {
  const supabase = createClient();
  const [{ data: items }, { data: pendingRedemptions }] = await Promise.all([
    supabase.from("catalog_items").select("*").order("created_at", { ascending: false }),
    supabase
      .from("redemptions")
      .select("id, points_spent, status, created_at, profile:profile_id(display_name), catalog_item:catalog_item_id(name)")
      .in("status", ["pending"])
      .order("created_at"),
  ]);

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="mb-4 text-2xl font-semibold">Catálogo y canjes</h1>

      <h2 className="mb-2 text-lg font-medium">Canjes pendientes de aprobación</h2>
      {pendingRedemptions?.length === 0 && <p className="mb-6 text-sm text-neutral-700">No hay canjes pendientes.</p>}
      <ul className="mb-8 space-y-2">
        {pendingRedemptions?.map((r: any) => (
          <li key={r.id} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 text-sm">
            <span>{r.profile?.display_name} · {r.catalog_item?.name} · {r.points_spent} pts</span>
            <RedemptionActions redemptionId={r.id} />
          </li>
        ))}
      </ul>

      <h2 className="mb-2 text-lg font-medium">Productos y beneficios</h2>
      <ul className="mb-6 space-y-2">
        {items?.map((item) => (
          <li key={item.id} className="rounded-xl border border-neutral-200 bg-white p-3 text-sm">
            {item.name} — {item.points_cost} pts — stock: {item.is_unlimited_stock ? "ilimitado" : item.stock ?? 0}
            {!item.is_active && <em className="ml-2 text-neutral-700">(inactivo)</em>}
          </li>
        ))}
      </ul>

      <form action={createCatalogItemAction} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="font-medium">Nuevo producto/beneficio</h2>
        <input name="name" required placeholder="Nombre" className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
        <textarea name="description" placeholder="Descripción" className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
        <select name="type" required className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm">
          <option value="physical">Producto físico</option>
          <option value="gift_card">Gift card</option>
          <option value="experience">Experiencia</option>
          <option value="flexible_benefit">Beneficio flexible</option>
          <option value="day_off">Día libre</option>
          <option value="other">Otro</option>
        </select>
        <input name="pointsCost" type="number" required min={1} placeholder="Costo en puntos" className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
        <input name="stock" type="number" min={0} placeholder="Stock (vacío = ilimitado)" className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="requiresApproval" value="true" /> Requiere aprobación
        </label>
        <button className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Crear</button>
      </form>
    </main>
  );
}
