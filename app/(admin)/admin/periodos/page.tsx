import { createClient } from "@/lib/supabase/server";
import { monthName } from "@/lib/format";
import { updatePeriodConfigAction } from "./actions";
import { OpenPeriodButton } from "./open-period-button";

export default async function AdminPeriodsPage() {
  const supabase = createClient();
  const { data: period } = await supabase
    .from("periods")
    .select("*")
    .eq("status", "open")
    .maybeSingle();

  const mes = monthName();

  return (
    <main className="mt-6 max-w-xl space-y-4">
      {!period && (
        <section className="card border-warning/50 bg-warning/10 p-5">
          <h2 className="font-heading text-base font-extrabold">No hay un período abierto</h2>
          <p className="mt-1.5 font-ui text-sm text-graphite">
            Sin período abierto, nadie puede enviar reconocimientos. Al abrirlo se
            asignan los créditos del mes a todas las personas activas (operación
            segura de repetir: no duplica saldos).
          </p>
          <div className="mt-4">
            <OpenPeriodButton monthLabel={mes} />
          </div>
          <p className="mt-3 font-ui text-xs text-mist">
            Idealmente esto lo hace solo el job mensual con pg_cron (paso 9 de la
            guía de despliegue). Este botón es el plan B manual.
          </p>
        </section>
      )}

      {period && (
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-extrabold">
              Período abierto · {mes} {period.year}
            </h2>
            <span className="rounded-sm bg-verde px-2 py-0.5 font-ui text-[11px] font-bold text-ink">
              Abierto
            </span>
          </div>

          <form action={updatePeriodConfigAction} className="mt-4 space-y-4">
            <input type="hidden" name="periodId" value={period.id} />
            <div>
              <label htmlFor="pd-credits" className="label">Créditos por persona al mes</label>
              <input
                id="pd-credits"
                name="defaultCredits"
                type="number"
                min={0}
                defaultValue={period.default_credits}
                className="input"
              />
              <p className="mt-1.5 font-ui text-xs text-mist">
                Cambiar esto no toca saldos ya asignados este mes; aplica a futuras asignaciones.
              </p>
            </div>
            <div>
              <label htmlFor="pd-min" className="label">Mínimo por reconocimiento</label>
              <input
                id="pd-min"
                name="minRecognitionAmount"
                type="number"
                min={1}
                defaultValue={period.min_recognition_amount}
                className="input"
              />
            </div>
            <button className="btn-primary">Guardar cambios</button>
          </form>
        </section>
      )}

      <section className="card p-5">
        <h2 className="font-heading text-sm font-extrabold">Cómo funciona el ciclo</h2>
        <p className="mt-2 font-ui text-xs leading-relaxed text-graphite">
          Cada mes se abre un período y todas las personas activas reciben sus créditos
          para reconocer. Al cierre del mes, los créditos no usados expiran (no se
          acumulan). Los puntos recibidos, en cambio, viven en la billetera durante
          todo el año y vencen el 31 de diciembre.
        </p>
      </section>
    </main>
  );
}
