import { createClient } from "@/lib/supabase/server";
import { toggleUserStatusAction } from "./actions";
import { UserRoleSelect } from "./user-role-select";

export default async function AdminUsersPage() {
  const supabase = createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, display_name, email, role, status, area")
    .order("display_name");

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="mb-1 text-2xl font-semibold">Usuarios</h1>
      <p className="mb-4 text-sm text-neutral-700">
        La importación masiva por CSV queda como extensión P1 — ver docs/KNOWN_LIMITATIONS.md.
      </p>

      <table className="w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white text-sm">
        <thead className="bg-neutral-100 text-left">
          <tr>
            <th className="p-3">Nombre</th>
            <th className="p-3">Área</th>
            <th className="p-3">Rol</th>
            <th className="p-3">Estado</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {users?.map((u) => (
            <tr key={u.id} className="border-t border-neutral-100">
              <td className="p-3">{u.display_name}<br /><span className="text-xs text-neutral-700">{u.email}</span></td>
              <td className="p-3">{u.area}</td>
              <td className="p-3">
                <UserRoleSelect userId={u.id} currentRole={u.role} />
              </td>
              <td className="p-3">{u.status === "active" ? "Activo" : "Inactivo"}</td>
              <td className="p-3">
                <form action={toggleUserStatusAction}>
                  <input type="hidden" name="userId" value={u.id} />
                  <input type="hidden" name="status" value={u.status === "active" ? "inactive" : "active"} />
                  <button className="rounded-lg border border-neutral-200 px-3 py-1 text-xs hover:bg-neutral-100">
                    {u.status === "active" ? "Desactivar" : "Activar"}
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
