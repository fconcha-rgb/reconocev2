import { createClient } from "@/lib/supabase/server";

export type AdminContext = {
  adminId: string;
  organizationId: string;
};

// Verificación explícita de admin para toda Server Action que use la
// service role key (que bypassa RLS). El middleware protege las RUTAS,
// pero cada acción privilegiada debe validar por sí misma.
export async function requireAdmin(): Promise<
  { ok: true; ctx: AdminContext } | { ok: false; error: string }
> {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: "Sesión no válida." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status, organization_id")
    .eq("id", userData.user.id)
    .single();

  if (!profile || profile.role !== "admin" || profile.status !== "active") {
    return { ok: false, error: "No tienes permisos de administrador." };
  }

  return {
    ok: true,
    ctx: { adminId: userData.user.id, organizationId: profile.organization_id },
  };
}
