import { createClient } from "@/lib/supabase/server";
import { PointsChip } from "@/components/points-chip";
import { formatPoints } from "@/lib/format";
import { createCatalogItemAction, toggleCatalogItemAction } from "./actions";
import { RedemptionActions } from "./redemption-actions";

const TYPE_LABEL: Record<string, string> = {
  physical: "Producto",
  gift_card: "Gift card",
  experience: "Experiencia",
  flexible_benefit: "Beneficio",
  day_off: "Día libre",
  other: "Otro",
};

export default async function AdminCatalogPage() {
  const supabase = createClient();
  const [{ data: items }, { data: pendingRedemptions }] = await Promise.all([
    supabase.from("catalog_items").select("*").order("created_at", { ascending: false }),
    supabase
      .from("redemptions")
      .select(
        "id, points_spent, status, created_at, profile:profile_id(display_name), catalog_item:catalog_item_id(name)"
      )
      .in("status", ["pending"])
      .order("created_at"),
  ]);

  return (
    <main className="mt-6 space-y-8">
      {/* Canjes pendientes */}
      <section>
        <h2 className="font-heading text-base font-extrabold">
          Canjes por aprobar{" "}
          {pendingRedemptions && pendingRedemptions.length > 0 && (
            <span className="ml-1 rounded-sm bg-warning px-2 py-0.5 font-ui text-xs font-bold text-ink">
              {pendingRedemptions.length}
            </span>
          )}
        </h2>
        {pendingRedemptions?.length === 0 && (
          <p className="card mt-3 p-5 font-ui text-sm text-graphite">
            No hay canjes esperando aprobación. Todo al día.
          </p>
        )}
        <ul className="mt-3 space-y-2">
          {pendingRedemptions?.map((r: any) => (
            <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-ui text-sm font-semibold">
                  {r.profile?.display_name} <span className="font-normal text-graphite">quiere canjear</span>{" "}
                  {r.catalog_item?.name}
                </p>
                <p className="mt-0.5 font-ui text-xs text-mist">{formatPoints(r.points_spent)} pts</p>
              </div>
              <RedemptionActions redemptionId={r.id} />
            </li>
          ))}
        </ul>
      </section>

      {/* Productos */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <div>
          <h2 className="font-heading text-base font-extrabold">Productos y beneficios</h2>
          <ul className="mt-3 space-y-2">
            {items?.map((item) => (
              <li key={item.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-ui text-sm font-bold">{item.name}</p>
                    <span className="rounded-sm bg-line-soft px-2 py-0.5 font-ui text-[10px] font-bold uppercase tracking-wider text-graphite">
                      {TYPE_LABEL[item.type] ?? item.type}
                    </span>
                    {!item.is_active && (
                      <span className="rounded-sm bg-line-soft px-2 py-0.5 font-ui text-[11px] font-bold text-mist">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-ui text-xs text-mist">
                    Stock: {item.is_unlimited_stock ? "ilimitado" : formatPoints(item.stock ?? 0)}
                    {item.requires_approval && " · requiere aprobación"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <PointsChip amount={item.points_cost} />
                  <form action={toggleCatalogItemAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="isActive" value={String(!item.is_active)} />
                    <button className="btn-ghost">{item.is_active ? "Desactivar" : "Activar"}</button>
                  </form>
                </div>
              </li>
            ))}
            {items?.length === 0 && (
              <li className="card p-6 font-ui text-sm text-graphite">El catálogo está vacío — crea el primer producto.</li>
            )}
          </ul>
        </div>

        <form action={createCatalogItemAction} className="card h-fit space-y-3 p-5">
          <h2 className="font-heading text-base font-extrabold">Nuevo producto o beneficio</h2>
          <div>
            <label htmlFor="c-name" className="label">Nombre</label>
            <input id="c-name" name="name" required placeholder="p. ej. Gift card $20.000" className="input" />
          </div>
          <div>
            <label htmlFor="c-desc" className="label">Descripción <span className="normal-case text-mist">(opcional)</span></label>
            <textarea id="c-desc" name="description" rows={2} className="input resize-y" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="c-type" className="label">Tipo</label>
              <select id="c-type" name="type" required className="input">
                <option value="gift_card">Gift card</option>
                <option value="physical">Producto físico</option>
                <option value="experience">Experiencia</option>
                <option value="flexible_benefit">Beneficio flexible</option>
                <option value="day_off">Día libre</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div>
              <label htmlFor="c-cost" className="label">Costo (pts)</label>
              <input id="c-cost" name="pointsCost" type="number" required min={1} className="input" />
            </div>
          </div>
          <div>
            <label htmlFor="c-stock" className="label">Stock <span className="normal-case text-mist">(vacío = ilimitado)</span></label>
            <input id="c-stock" name="stock" type="number" min={0} className="input" />
          </div>
          <label className="flex items-center gap-2 font-ui text-sm text-graphite">
            <input type="checkbox" name="requiresApproval" value="true" className="h-4 w-4 accent-ink" />
            Requiere aprobación del admin antes de entregarse
          </label>
          <button className="btn-primary">Crear</button>
        </form>
      </section>
    </main>
  );
}
