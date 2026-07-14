# Resultados de tests

**Importante**: este entorno de generación de código no tiene acceso a red
(no se puede correr `npm install`), por lo que los siguientes resultados
son de **revisión estática del código**, no de ejecución real. Antes de
considerar el sistema listo, tu equipo debe ejecutar cada suite y
reemplazar esta tabla con resultados reales.

| Suite | Estado | Cómo ejecutarla |
|---|---|---|
| `npm run lint` | No ejecutado aquí | `npm install && npm run lint` |
| `npm run typecheck` | No ejecutado aquí | `npm install && npm run typecheck` |
| `npm run test` (Vitest) | No ejecutado aquí | `npm install && npm run test` |
| `npm run build` | No ejecutado aquí | `npm install && npm run build` |
| Tests SQL (pgTAP) | No ejecutado aquí | Requiere `supabase test db`, ver `docs/DEPLOYMENT_GUIDE.md` |
| Smoke E2E (Playwright) | No ejecutado aquí | `npx playwright install && npx playwright test` |

## Cobertura de tests incluida en el código (por revisar, no por confiar ciegamente)

- `tests/validations.test.ts`: valida los esquemas Zod de reconocimiento y
  canje (mensaje vacío, monto negativo, UUID inválido).
- `tests/sql/critical_rules.sql`: autorreconocimiento bloqueado, monto bajo
  el mínimo, pilar inactivo, saldo insuficiente, idempotencia (no duplica
  con la misma key), canje sin saldo, acceso entre organizaciones vía RLS,
  edición de períodos bloqueada para no-admin, stock no negativo.
- `tests/e2e/critical-flows.spec.ts`: flujo completo de reconocimiento
  (login → reconocer → aparece en feed) y bloqueo de canje sin saldo.

## No cubierto todavía (agregar antes de producción)
- Test de concurrencia real (dos requests simultáneas al mismo saldo) —
  el `for update` en las funciones SQL previene el problema, pero no hay
  un test automatizado que dispare la carrera real; considera un test con
  `Promise.all` de dos llamadas RPC simultáneas.
- Test de job duplicado (ejecutar `job_close_monthly_period` dos veces y
  confirmar que no duplica movimientos) — la lógica es idempotente por
  diseño (ledger con `idempotency_key` único), pero falta el test explícito.
