import Link from "next/link";
import { Award, ArrowRight, Gift } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/avatar";
import { PointsChip } from "@/components/points-chip";
import { formatPoints, monthName, relativeTime } from "@/lib/format";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  const [{ data: profile }, { data: openPeriod }, { data: wallet }, { data: recent }] =
    await Promise.all([
      supabase.from("profiles").select("first_name, display_name, role").eq("id", userId).single(),
      supabase.from("periods").select("id").eq("status", "open").limit(1).maybeSingle(),
      supabase.from("wallet_balances").select("balance").eq("profile_id", userId).maybeSingle(),
      supabase
        .from("recognitions")
        .select(
          "id, amount, message, created_at, sender:sender_id(display_name), receiver:receiver_id(display_name), pillar:pillar_id(name)"
        )
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  const { data: giving } = openPeriod
    ? await supabase
        .from("giving_credit_balances")
        .select("balance, allocated")
        .eq("period_id", openPeriod.id)
        .eq("profile_id", userId)
        .maybeSingle()
    : { data: null };

  const balance = giving?.balance ?? 0;
  const allocated = giving?.allocated ?? 0;
  const pct = allocated > 0 ? Math.round((balance / allocated) * 100) : 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <p className="overline">{monthName()}</p>
      <h1 className="mt-1 text-3xl font-black lowercase tracking-tight">
        hola, {profile?.first_name?.toLowerCase() ?? "colaborador"}
      </h1>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* Créditos para reconocer */}
        <section className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="overline">Créditos para reconocer</p>
              <p className="mt-2 font-heading text-4xl font-black">
                {formatPoints(balance)}
                <span className="ml-1 text-base font-bold text-mist">/ {formatPoints(allocated)}</span>
              </p>
            </div>
            <span className="rounded bg-line-soft p-2.5 text-graphite">
              <Award className="h-5 w-5" />
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-line-soft" role="presentation">
            <div className="h-full bg-verde transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 font-ui text-xs text-mist">
            {openPeriod
              ? "Se renuevan cada mes y no se acumulan: úsalos antes de fin de mes."
              : "El período del mes aún no está abierto — avísale al administrador."}
          </p>

          <Link href="/reconocer" className="btn-primary mt-5">
            Reconocer a alguien <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Billetera */}
        <section className="card flex flex-col bg-ink p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="overline text-white/50">Tus puntos acumulados</p>
              <p className="mt-2 font-heading text-4xl font-black text-neon">
                {formatPoints(wallet?.balance ?? 0)}
                <span className="ml-1.5 text-base font-bold text-white/50">pts</span>
              </p>
            </div>
            <span className="rounded bg-white/10 p-2.5 text-neon">
              <Gift className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 font-ui text-xs text-white/50">
            Los puntos que recibes se acumulan todo el año y vencen el 31 de diciembre.
          </p>
          <div className="mt-auto flex gap-2 pt-5">
            <Link href="/catalogo" className="btn-primary bg-white text-ink hover:bg-neon">
              Ver catálogo
            </Link>
            <Link href="/billetera" className="btn-ghost text-white/70 hover:bg-white/10 hover:text-white">
              Movimientos
            </Link>
          </div>
        </section>
      </div>

      {/* Últimos reconocimientos */}
      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-extrabold">Último en el equipo</h2>
          <Link href="/feed" className="font-ui text-xs font-bold text-graphite hover:text-ink">
            Ver todo el feed →
          </Link>
        </div>

        {(!recent || recent.length === 0) && (
          <div className="card p-6 text-center">
            <p className="font-ui text-sm text-graphite">
              Aún no hay reconocimientos este mes. Sé quien parte:
            </p>
            <Link href="/reconocer" className="btn-secondary mt-3">
              Enviar el primero
            </Link>
          </div>
        )}

        <ul className="space-y-3">
          {recent?.map((r: any) => (
            <li key={r.id} className="card flex items-start gap-3 p-4">
              <Avatar name={r.receiver?.display_name ?? "?"} tone="verde" />
              <div className="min-w-0 flex-1">
                <p className="font-ui text-sm text-graphite">
                  <strong className="text-ink">{r.sender?.display_name}</strong> reconoció a{" "}
                  <strong className="text-ink">{r.receiver?.display_name}</strong>
                </p>
                <p className="mt-1 truncate font-ui text-sm text-ink">{r.message}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {r.pillar?.name && <span className="tag-pillar">{r.pillar.name}</span>}
                  <PointsChip amount={r.amount} signed />
                  <span className="font-ui text-xs text-mist">{relativeTime(r.created_at)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
