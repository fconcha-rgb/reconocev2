import { createClient } from "@/lib/supabase/server";
import { RecognitionForm } from "./recognition-form";

export default async function RecognizePage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  const [{ data: colleagues }, { data: pillars }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, job_title, area")
      .neq("id", userData.user?.id ?? "")
      .eq("status", "active")
      .order("display_name"),
    supabase.from("pillars").select("id, name, icon").eq("is_active", true).order("sort_order"),
  ]);

  return (
    <main className="mx-auto max-w-xl p-4 sm:p-6">
      <h1 className="mb-1 text-2xl font-semibold">Reconocer a un colaborador</h1>
      <p className="mb-6 text-neutral-700">
        Elige a quién, cuánto y por qué — este monto se descuenta de tus créditos del mes.
      </p>
      <RecognitionForm colleagues={colleagues ?? []} pillars={pillars ?? []} />
    </main>
  );
}
