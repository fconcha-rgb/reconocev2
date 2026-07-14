import { createClient } from "@/lib/supabase/server";
import { RecognitionForm } from "./recognition-form";

export default async function RecognizePage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  const [{ data: colleagues }, { data: pillars }, { data: openPeriod }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, job_title, area")
      .neq("id", userId ?? "")
      .eq("status", "active")
      .order("display_name"),
    supabase
      .from("pillars")
      .select("id, name, description")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("periods")
      .select("id, min_recognition_amount")
      .eq("status", "open")
      .limit(1)
      .maybeSingle(),
  ]);

  const { data: giving } = openPeriod
    ? await supabase
        .from("giving_credit_balances")
        .select("balance")
        .eq("period_id", openPeriod.id)
        .eq("profile_id", userId)
        .maybeSingle()
    : { data: null };

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-extrabold">Reconocer</h1>
      <p className="mt-1 font-ui text-sm text-graphite">
        Elige a quién, cuánto y por qué. El monto se descuenta de tus créditos del mes
        y llega como puntos a la billetera de la otra persona.
      </p>

      {!openPeriod ? (
        <div className="card mt-6 p-6">
          <p className="font-ui text-sm text-graphite">
            El período de este mes todavía no está abierto, así que por ahora no se
            pueden enviar reconocimientos. Avísale al administrador del programa.
          </p>
        </div>
      ) : (
        <RecognitionForm
          colleagues={colleagues ?? []}
          pillars={pillars ?? []}
          balance={giving?.balance ?? 0}
          minAmount={openPeriod.min_recognition_amount}
        />
      )}
    </main>
  );
}
