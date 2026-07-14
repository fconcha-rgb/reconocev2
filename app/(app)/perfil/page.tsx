import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user?.id)
    .single();

  return (
    <main className="mx-auto max-w-xl p-4 sm:p-6">
      <h1 className="mb-4 text-2xl font-semibold">Mi perfil</h1>
      <dl className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 text-sm">
        <Row label="Nombre" value={profile?.display_name} />
        <Row label="Correo" value={profile?.email} />
        <Row label="Cargo" value={profile?.job_title} />
        <Row label="Área" value={profile?.area} />
        <Row label="Equipo" value={profile?.team} />
      </dl>
      <p className="mt-3 text-xs text-neutral-700">
        Para actualizar tus datos, contacta a RRHH — el piloto no habilita edición de perfil por el
        colaborador.
      </p>
    </main>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between border-b border-neutral-100 pb-2 last:border-0">
      <dt className="text-neutral-700">{label}</dt>
      <dd>{value ?? "—"}</dd>
    </div>
  );
}
