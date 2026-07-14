import { createClient } from "@/lib/supabase/server";
import { updatePeriodConfigAction } from "./actions";

export default async function AdminPeriodsPage() {
  const supabase = createClient();
  const { data: period } = await supabase
    .from("periods")
    .select("*")
    .eq("status", "open")
    .maybeSingle();

  return (
    <main className="mx-auto max-w-xl p-4 sm:p-6">
      <h1 className="mb-4 text-2xl font-semibold">Período actual</h1>

      {!period && <p className="text-sm text-neutral-700">No hay un período abierto. Se abre automáticamente el job mensual.</p>}

      {period && (
        <form action={updatePeriodConfigAction} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
          <input type="hidden" name="periodId" value={period.id} />
          <div>
            <label className="mb-1 block text-sm font-medium">Créditos por defecto al mes</label>
            <input
              name="defaultCredits"
              type="number"
              min={0}
              defaultValue={period.default_credits}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-neutral-700">
              Cambiar esto no afecta saldos ya asignados este mes, solo futuras asignaciones.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Mínimo por reconocimiento</label>
            <input
              name="minRecognitionAmount"
              type="number"
              min={1}
              defaultValue={period.min_recognition_amount}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <button className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Guardar
          </button>
        </form>
      )}
    </main>
  );
}
