import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";

// Shell persistente de la app: header (desktop) + tab bar (móvil).
// El middleware ya garantiza sesión activa en estas rutas.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  const [{ data: profile }, { data: openPeriod }] = await Promise.all([
    supabase.from("profiles").select("display_name, role").eq("id", userId).single(),
    supabase.from("periods").select("id").eq("status", "open").limit(1).maybeSingle(),
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
    <div className="min-h-screen">
      <AppHeader
        displayName={profile?.display_name ?? "Colaborador"}
        isAdmin={profile?.role === "admin"}
        credits={giving?.balance ?? null}
      />
      <div className="pb-24 md:pb-10">{children}</div>
      <BottomNav />
    </div>
  );
}
