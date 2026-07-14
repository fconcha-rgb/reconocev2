import Link from "next/link";
import {
  CalendarDays,
  CreditCard,
  Gift,
  HeartHandshake,
  Package,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PointsChip } from "@/components/points-chip";
import { formatPoints } from "@/lib/format";
import { RedeemButton } from "./redeem-button";

const DEFAULT_META = { label: "Otro", Icon: Gift };

const TYPE_META: Record<string, { label: string; Icon: any }> = {
  physical: { label: "Producto", Icon: Package },
  gift_card: { label: "Gift card", Icon: CreditCard },
  experience: { label: "Experiencia", Icon: Sparkles },
  flexible_benefit: { label: "Beneficio", Icon: HeartHandshake },
  day_off: { label: "Día libre", Icon: CalendarDays },
  other: { label: "Otro", Icon: Gift },
};

const MAX_PRESETS = [500, 1000, 2000];

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { maxPoints?: string };
}) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: wallet } = await supabase
    .from("wallet_balances")
    .select("balance")
    .eq("profile_id", userData.user?.id)
    .maybeSingle();

  let query = supabase.from("catalog_items").select("*").eq("is_active", true).order("points_cost");
  const maxPoints = Number(searchParams.maxPoints) || null;
  if (maxPoints) query = query.lte("points_cost", maxPoints);

  const { data: items } = await query;
  const balance = wallet?.balance ?? 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Catálogo</h1>
          <p className="mt-1 font-ui text-sm text-graphite">
            Canjea los puntos que has recibido del equipo.
          </p>
        </div>
        <PointsChip amount={balance} />
      </div>

      {/* Filtro rápido por costo */}
      <div className="scrollbar-none -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1">
        <Link
          href="/catalogo"
          className={`shrink-0 rounded-full px-3.5 py-1.5 font-ui text-xs font-semibold ${
            !maxPoints ? "bg-ink text-white" : "border border-line bg-white text-graphite"
          }`}
        >
          Todo
        </Link>
        {MAX_PRESETS.map((v) => (
          <Link
            key={v}
            href={`/catalogo?maxPoints=${v}`}
            className={`shrink-0 rounded-full px-3.5 py-1.5 font-ui text-xs font-semibold ${
              maxPoints === v ? "bg-ink text-white" : "border border-line bg-white text-graphite"
            }`}
          >
            Hasta {formatPoints(v)} pts
          </Link>
        ))}
        <Link
          href={`/catalogo?maxPoints=${balance}`}
          className="shrink-0 rounded-full border border-line bg-white px-3.5 py-1.5 font-ui text-xs font-semibold text-graphite"
        >
          Lo que me alcanza
        </Link>
      </div>

      {items?.length === 0 && (
        <div className="card mt-5 p-8 text-center">
          <p className="font-ui text-sm text-graphite">
            No hay productos con ese filtro. Prueba con “Todo”.
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items?.map((item) => {
          const { label, Icon } = TYPE_META[item.type] ?? DEFAULT_META;
          const affordable = balance >= item.points_cost;
          const noStock = !item.is_unlimited_stock && (item.stock ?? 0) < 1;
          return (
            <article key={item.id} className="card flex flex-col overflow-hidden">
              {/* Tile visual con la "f" lima de fondo, como en el kit retail */}
              <div className="relative flex h-28 items-center justify-center bg-soft">
                <span
                  aria-hidden
                  className="pointer-events-none absolute font-heading text-7xl font-black text-verde/40"
                >
                  f
                </span>
                <Icon className="relative h-9 w-9 text-ink" />
                <span className="absolute left-3 top-3 rounded-sm bg-white px-2 py-0.5 font-ui text-[10px] font-bold uppercase tracking-wider text-graphite">
                  {label}
                </span>
                {noStock && (
                  <span className="absolute right-3 top-3 rounded-sm bg-danger px-2 py-0.5 font-ui text-[10px] font-bold uppercase text-white">
                    Agotado
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h2 className="font-ui text-sm font-bold leading-snug">{item.name}</h2>
                {item.description && (
                  <p className="mt-1 line-clamp-2 font-ui text-xs text-graphite">{item.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between pt-4">
                  <PointsChip amount={item.points_cost} />
                  <RedeemButton
                    catalogItemId={item.id}
                    itemName={item.name}
                    disabled={!affordable || noStock}
                    disabledReason={noStock ? "Agotado" : "Te faltan puntos"}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
