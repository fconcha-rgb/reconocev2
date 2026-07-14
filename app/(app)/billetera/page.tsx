import { createClient } from "@/lib/supabase/server";

export default async function WalletPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const [{ data: wallet }, { data: movements }] = await Promise.all([
    supabase.from("wallet_balances").select("balance, year").eq("profile_id", userData.user?.id).maybeSingle(),
    supabase
      .from("wallet_ledger")
      .select("amount, reason, created_at")
      .eq("profile_id", userData.user?.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="mb-1 text-2xl font-semibold">Tu billetera</h1>
      <p className="mb-4 text-sm text-neutral-700">
        Tus puntos son válidos hasta el 31 de diciembre de {wallet?.year ?? new Date().getFullYear()}.
      </p>
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <p className="text-sm text-neutral-700">Saldo disponible para canjear</p>
        <p className="text-3xl font-semibold text-primary">{wallet?.balance ?? 0} pts</p>
      </div>

      <h2 className="mb-2 text-lg font-medium">Historial</h2>
      {movements?.length === 0 && <p className="text-sm text-neutral-700">Aún no tienes movimientos.</p>}
      <ul className="space-y-2">
        {movements?.map((m, i) => (
          <li key={i} className="flex justify-between rounded-xl border border-neutral-200 bg-white p-3 text-sm">
            <span>{reasonLabel(m.reason)}</span>
            <span className={m.amount >= 0 ? "text-green-700" : "text-neutral-700"}>
              {m.amount >= 0 ? "+" : ""}{m.amount} pts
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}

function reasonLabel(reason: string) {
  const labels: Record<string, string> = {
    recognition: "Reconocimiento recibido",
    redemption: "Canje",
    refund: "Reembolso de canje",
    expiration: "Expiración de fin de año",
    reversal: "Ajuste administrativo",
  };
  return labels[reason] ?? reason;
}
