import { ArrowDownRight, ArrowUpRight, RotateCcw, Timer } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPoints, relativeTime } from "@/lib/format";

const REASON_META: Record<string, { label: string; Icon: any }> = {
  recognition: { label: "Reconocimiento recibido", Icon: ArrowUpRight },
  redemption: { label: "Canje en el catálogo", Icon: ArrowDownRight },
  refund: { label: "Reembolso de canje", Icon: RotateCcw },
  expiration: { label: "Expiración de fin de año", Icon: Timer },
  reversal: { label: "Ajuste administrativo", Icon: RotateCcw },
};

export default async function WalletPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const [{ data: wallet }, { data: movements }] = await Promise.all([
    supabase
      .from("wallet_balances")
      .select("balance, year")
      .eq("profile_id", userData.user?.id)
      .maybeSingle(),
    supabase
      .from("wallet_ledger")
      .select("amount, reason, created_at")
      .eq("profile_id", userData.user?.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const year = wallet?.year ?? new Date().getFullYear();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-extrabold">Tu billetera</h1>

      {/* Saldo: número neón sobre negro, la firma visual de los puntos */}
      <section className="card mt-4 bg-ink p-6 text-white">
        <p className="overline text-white/50">Puntos disponibles para canjear</p>
        <p className="mt-2 font-heading text-5xl font-black text-neon">
          {formatPoints(wallet?.balance ?? 0)}
          <span className="ml-2 text-lg font-bold text-white/50">pts</span>
        </p>
        <p className="mt-3 font-ui text-xs text-white/50">
          Válidos hasta el 31 de diciembre de {year}. Lo que no canjees ese día, expira.
        </p>
      </section>

      <h2 className="mt-8 text-lg font-extrabold">Movimientos</h2>
      {(!movements || movements.length === 0) && (
        <p className="card mt-3 p-6 font-ui text-sm text-graphite">
          Aún no tienes movimientos. Cuando alguien te reconozca, los puntos aparecen aquí.
        </p>
      )}

      <ul className="mt-3 space-y-2">
        {movements?.map((m, i) => {
          const meta = REASON_META[m.reason] ?? { label: m.reason, Icon: RotateCcw };
          const positive = m.amount >= 0;
          return (
            <li key={i} className="card flex items-center gap-3 p-3.5">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded ${
                  positive ? "bg-verde/25 text-ink" : "bg-line-soft text-graphite"
                }`}
              >
                <meta.Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-ui text-sm font-semibold">{meta.label}</p>
                <p className="font-ui text-xs text-mist">{relativeTime(m.created_at)}</p>
              </div>
              <span className={`font-ui text-sm font-bold ${positive ? "text-success" : "text-graphite"}`}>
                {positive ? "+" : ""}
                {formatPoints(m.amount)} pts
              </span>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
