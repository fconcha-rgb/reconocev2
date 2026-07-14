import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  const [{ data: profile }, { data: openPeriod }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", userId).single(),
    supabase.from("periods").select("id").eq("status", "open").limit(1).maybeSingle(),
  ]);

  const { data: givingBalance } = openPeriod
    ? await supabase
        .from("giving_credit_balances")
        .select("balance, allocated")
        .eq("period_id", openPeriod.id)
        .eq("profile_id", userId)
        .maybeSingle()
    : { data: null };

  const { data: wallet } = await supabase
    .from("wallet_balances")
    .select("balance")
    .eq("profile_id", userId)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="mb-1 text-2xl font-semibold">Hola, {profile?.display_name ?? "colaborador"}</h1>
      <p className="mb-6 text-neutral-700">Este es tu resumen del mes</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-700">Créditos por repartir este mes</p>
          <p className="mt-1 text-3xl font-semibold text-primary">
            {givingBalance?.balance ?? 0}
            <span className="text-base font-normal text-neutral-700"> / {givingBalance?.allocated ?? 0}</span>
          </p>
          <Link
            href="/reconocer"
            className="mt-4 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Reconocer a alguien
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-700">Puntos acumulados en tu billetera</p>
          <p className="mt-1 text-3xl font-semibold text-accent-foreground">{wallet?.balance ?? 0}</p>
          <Link
            href="/catalogo"
            className="mt-4 inline-block rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
          >
            Ver catálogo
          </Link>
        </div>
      </div>

      <nav className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link href="/feed" className="rounded-full border border-neutral-200 px-4 py-2 hover:bg-neutral-100">Feed</Link>
        <Link href="/billetera" className="rounded-full border border-neutral-200 px-4 py-2 hover:bg-neutral-100">Billetera</Link>
        <Link href="/perfil" className="rounded-full border border-neutral-200 px-4 py-2 hover:bg-neutral-100">Mi perfil</Link>
      </nav>
    </main>
  );
}
