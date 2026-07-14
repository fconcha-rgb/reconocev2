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
        className="rounded-lg border border-neutral-200 px-2 py-1 text-xs"
      >
        <option value="collaborator">Colaborador</option>
        <option value="admin">Admin</option>
      </select>
    </form>
  );
}
