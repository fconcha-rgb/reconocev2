# Modelo de datos

Fuente de verdad: `supabase/migrations/0001_init.sql`, `0002_functions.sql`,
`0003_jobs.sql`.

## Principio central

**Créditos para reconocer** y **puntos para canjear** son dos saldos
independientes, cada uno respaldado por un ledger inmutable + un saldo
materializado:

- `giving_ledger` + `giving_credit_balances` → créditos para dar (mensuales, no acumulables, expiran al cierre del período).
- `wallet_ledger` + `wallet_balances` → puntos recibidos (anuales, expiran el 31 de diciembre).

Ninguna columna de saldo se edita directamente desde la aplicación: toda
escritura pasa por `create_recognition()`, `redeem_catalog_item()` o
`resolve_redemption()`, funciones `SECURITY DEFINER` con `search_path` fijo
que validan reglas de negocio y usan locking (`for update`) para evitar
condiciones de carrera (doble clic, dos pestañas, reintentos).

## Entidades principales

`organizations` → `profiles` (rol, estado, jefatura) → `pillars` (editables)
→ `periods` (mensual, con mínimo y asignación editable) → `recognitions`
(transaccional) → `catalog_items` / `redemptions` (transaccional) →
`notifications` / `notification_outbox` (Teams, desacoplado) → `job_runs`
(auditoría de jobs) → `audit_log`.

## Idempotencia

Todas las operaciones financieras reciben una `idempotency_key` única
(columna `unique`). Un reintento con la misma key retorna el resultado ya
creado en vez de duplicar el movimiento — esto cubre doble clic, reintentos
de red y ejecuciones duplicadas de jobs.

Ver `docs/ERD.md` para el diagrama de relaciones.
