import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/avatar";
import { toggleUserStatusAction } from "./actions";
import { UserRoleSelect } from "./user-role-select";
import { CreateUserForm } from "./create-user-form";
import { ResetPassword } from "./reset-password";

export default async function AdminUsersPage() {
  const supabase = createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, display_name, email, role, status, area, job_title")
    .order("display_name");

  return (
    <main className="mt-6 space-y-6">
      <CreateUserForm />

      <section>
        <h2 className="font-heading text-base font-extrabold">
          Personas <span className="font-ui text-sm font-semibold text-mist">({users?.length ?? 0})</span>
        </h2>

        {/* Móvil: tarjetas */}
        <ul className="mt-3 space-y-2 md:hidden">
          {users?.map((u) => (
            <li key={u.id} className="card p-4">
              <div className="flex items-center gap-3">
                <Avatar name={u.display_name} size="sm" tone={u.status === "active" ? "soft" : "ink"} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-ui text-sm font-bold">{u.display_name}</p>
                  <p className="truncate font-ui text-xs text-mist">{u.email}</p>
                </div>
                <StatusBadge status={u.status} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3">
                <UserRoleSelect userId={u.id} currentRole={u.role} />
                <ToggleStatus userId={u.id} status={u.status} />
                <ResetPassword userId={u.id} userName={u.display_name} />
              </div>
            </li>
          ))}
        </ul>

        {/* Escritorio: tabla */}
        <div className="card mt-3 hidden overflow-hidden md:block">
          <table className="w-full text-left">
            <thead className="border-b border-line bg-soft">
              <tr className="font-ui text-xs uppercase tracking-wider text-graphite">
                <th className="px-4 py-3 font-semibold">Persona</th>
                <th className="px-4 py-3 font-semibold">Área</th>
                <th className="px-4 py-3 font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {users?.map((u) => (
                <tr key={u.id} className="font-ui text-sm">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.display_name} size="sm" tone={u.status === "active" ? "soft" : "ink"} />
                      <div>
                        <p className="font-semibold">{u.display_name}</p>
                        <p className="text-xs text-mist">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-graphite">{u.area ?? "—"}</td>
                  <td className="px-4 py-3">
                    <UserRoleSelect userId={u.id} currentRole={u.role} />
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <ResetPassword userId={u.id} userName={u.display_name} />
                      <ToggleStatus userId={u.id} status={u.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  return status === "active" ? (
    <span className="rounded-sm bg-verde px-2 py-0.5 font-ui text-[11px] font-bold text-ink">Activo</span>
  ) : (
    <span className="rounded-sm bg-line-soft px-2 py-0.5 font-ui text-[11px] font-bold text-mist">Inactivo</span>
  );
}

function ToggleStatus({ userId, status }: { userId: string; status: string }) {
  return (
    <form action={toggleUserStatusAction} className="inline">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="status" value={status === "active" ? "inactive" : "active"} />
      <button className="btn-ghost">{status === "active" ? "Desactivar" : "Activar"}</button>
    </form>
  );
}
