import { createClient } from "@/lib/supabase/server";
import { createPillarAction, togglePillarAction } from "./actions";

export default async function AdminPillarsPage() {
  const supabase = createClient();
  const { data: pillars } = await supabase.from("pillars").select("*").order("sort_order");

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="mb-4 text-2xl font-semibold">Pilares</h1>

      <ul className="mb-6 space-y-2">
        {pillars?.map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 text-sm">
            <span>{p.name} {!p.is_active && <em className="text-neutral-700">(inactivo)</em>}</span>
            <form action={togglePillarAction}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="isActive" value={String(!p.is_active)} />
              <button className="rounded-lg border border-neutral-200 px-3 py-1 hover:bg-neutral-100">
                {p.is_active ? "Desactivar" : "Activar"}
              </button>
            </form>
          </li>
        ))}
      </ul>

      <form action={createPillarAction} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="font-medium">Nuevo pilar</h2>
        <input name="name" required placeholder="Nombre" className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
        <textarea name="description" placeholder="Descripción" className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
        <button className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Crear</button>
      </form>
    </main>
  );
}
