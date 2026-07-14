import { createClient } from "@/lib/supabase/server";
import { createPillarAction, togglePillarAction } from "./actions";

export default async function AdminPillarsPage() {
  const supabase = createClient();
  const { data: pillars } = await supabase.from("pillars").select("*").order("sort_order");

  return (
    <main className="mt-6 grid gap-6 lg:grid-cols-[1.4fr,1fr]">
      <section>
        <h2 className="font-heading text-base font-extrabold">Pilares del programa</h2>
        <p className="mt-1 font-ui text-xs text-graphite">
          Son las categorías que la gente elige al reconocer. Desactivar uno lo saca
          del formulario, pero no borra los reconocimientos ya hechos.
        </p>
        <ul className="mt-3 space-y-2">
          {pillars?.map((p) => (
            <li key={p.id} className="card flex items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="tag-pillar">{p.name}</span>
                  {!p.is_active && (
                    <span className="rounded-sm bg-line-soft px-2 py-0.5 font-ui text-[11px] font-bold text-mist">
                      Inactivo
                    </span>
                  )}
                </div>
                {p.description && (
                  <p className="mt-1.5 font-ui text-xs text-graphite">{p.description}</p>
                )}
              </div>
              <form action={togglePillarAction} className="shrink-0">
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="isActive" value={String(!p.is_active)} />
                <button className="btn-ghost">{p.is_active ? "Desactivar" : "Activar"}</button>
              </form>
            </li>
          ))}
          {pillars?.length === 0 && (
            <li className="card p-6 font-ui text-sm text-graphite">Aún no hay pilares creados.</li>
          )}
        </ul>
      </section>

      <section>
        <form action={createPillarAction} className="card space-y-3 p-5">
          <h2 className="font-heading text-base font-extrabold">Nuevo pilar</h2>
          <div>
            <label htmlFor="p-name" className="label">Nombre</label>
            <input id="p-name" name="name" required placeholder="p. ej. Colaboración" className="input" />
          </div>
          <div>
            <label htmlFor="p-desc" className="label">Descripción <span className="normal-case text-mist">(opcional)</span></label>
            <textarea id="p-desc" name="description" rows={3} placeholder="Qué comportamiento premia este pilar" className="input resize-y" />
          </div>
          <button className="btn-primary">Crear pilar</button>
        </form>
      </section>
    </main>
  );
}
