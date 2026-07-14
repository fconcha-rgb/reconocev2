import { createClient } from "@/lib/supabase/server";
import { RedeemButton } from "./redeem-button";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { maxPoints?: string; category?: string };
}) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: wallet } = await supabase
    .from("wallet_balances")
    .select("balance")
    .eq("profile_id", userData.user?.id)
    .maybeSingle();

  let query = supabase.from("catalog_items").select("*").eq("is_active", true).order("points_cost");
  if (searchParams.maxPoints) query = query.lte("points_cost", Number(searchParams.maxPoints));
  if (searchParams.category) query = query.eq("category", searchParams.category);

  const { data: items } = await query;

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Catálogo</h1>
        <p className="text-sm text-neutral-700">Tienes {wallet?.balance ?? 0} pts</p>
      </div>

      <form className="mb-6 flex flex-wrap gap-3 text-sm" action="/catalogo">
        <input
          type="number"
          name="maxPoints"
          placeholder="Máximo de puntos"
          defaultValue={searchParams.maxPoints}
          className="rounded-xl border border-neutral-200 px-3 py-2"
        />
        <button type="submit" className="rounded-xl border border-neutral-200 px-3 py-2 hover:bg-neutral-100">
          Filtrar
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        {items?.map((item) => (
          <div key={item.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-700">{item.category}</p>
            <h2 className="mt-1 font-medium">{item.name}</h2>
            <p className="mt-1 text-sm text-neutral-700">{item.description}</p>
            <p className="mt-2 text-lg font-semibold text-primary">{item.points_cost} pts</p>
            <RedeemButton
              catalogItemId={item.id}
              disabled={(wallet?.balance ?? 0) < item.points_cost}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
