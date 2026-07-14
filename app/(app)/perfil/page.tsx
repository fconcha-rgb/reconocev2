import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/avatar";
import { ChangePasswordForm } from "./change-password";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user?.id)
    .single();

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-extrabold">Mi perfil</h1>

      <section className="card mt-4 p-5">
        <div className="flex items-center gap-4">
          <Avatar name={profile?.display_name ?? "?"} size="lg" tone="ink" />
          <div>
            <p className="font-heading text-lg font-extrabold">{profile?.display_name}</p>
            <p className="font-ui text-sm text-graphite">
              {[profile?.job_title, profile?.area].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
        </div>

        <dl className="mt-5 space-y-3 border-t border-line-soft pt-4">
          <Row label="Correo" value={profile?.email} />
          <Row label="Equipo" value={profile?.team} />
          <Row label="Rol" value={profile?.role === "admin" ? "Administrador" : "Colaborador"} />
        </dl>

        <p className="mt-4 font-ui text-xs text-mist">
          Para corregir tu nombre, cargo o área, pídeselo al administrador del programa.
        </p>
      </section>

      <ChangePasswordForm />
    </main>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="font-ui text-sm text-graphite">{label}</dt>
      <dd className="font-ui text-sm font-semibold">{value || "—"}</dd>
    </div>
  );
}
