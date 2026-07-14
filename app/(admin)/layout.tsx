import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { AdminTabs } from "@/components/admin-tabs";

// El middleware ya garantiza que solo admins activos llegan aquí.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userData.user?.id)
    .single();

  return (
    <div className="min-h-screen">
      <AppHeader displayName={profile?.display_name ?? "Admin"} isAdmin credits={null} />
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 md:pb-10">
        <p className="overline">Administración</p>
        <div className="mt-3">
          <AdminTabs />
        </div>
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
