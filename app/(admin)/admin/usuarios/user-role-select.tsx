"use client";

import { changeUserRoleAction } from "./actions";

export function UserRoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  return (
    <form
      action={changeUserRoleAction}
      onChange={(e) => (e.currentTarget as HTMLFormElement).requestSubmit()}
      className="inline"
    >
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={currentRole}
        aria-label="Rol"
        className="rounded-lg border border-line bg-white px-2 py-1.5 font-ui text-xs font-semibold"
      >
        <option value="collaborator">Colaborador</option>
        <option value="admin">Admin</option>
      </select>
    </form>
  );
}
