# PROJECT_MAP.md

## Estructura
```
app/
  (auth)/login/            → login dev (email/password) + botón Entra ID
  (app)/dashboard/         → resumen: créditos por repartir, puntos, accesos
  (app)/reconocer/         → flujo de reconocimiento (form + vista previa)
  (app)/feed/              → feed con filtro por pilar y paginación
  (app)/billetera/         → saldo e historial de puntos
  (app)/catalogo/          → catálogo filtrable + canje
  (app)/perfil/            → datos del colaborador
  (admin)/admin/usuarios/  → activar/desactivar, cambiar rol
  (admin)/admin/pilares/   → CRUD de pilares
  (admin)/admin/catalogo/  → CRUD de catálogo + aprobación de canjes
  (admin)/admin/periodos/  → editar créditos por defecto y mínimo
lib/
  supabase/                → clientes server/browser + service role
  actions/                 → server actions (reconocer, canjear)
  validations.ts           → esquemas Zod
middleware.ts              → protección de rutas /admin por rol
supabase/
  migrations/0001_init.sql       → esquema + RLS
  migrations/0002_functions.sql  → funciones transaccionales
  migrations/0003_jobs.sql       → jobs idempotentes (apertura/cierre/expiración)
  seed.sql                       → datos ficticios de desarrollo
tests/
  validations.test.ts       → unit tests Zod
  sql/critical_rules.sql    → tests pgTAP de reglas de negocio
  e2e/critical-flows.spec.ts → smoke Playwright
```

## Stack
Next.js 14 (App Router) + React 18 + TypeScript strict + Tailwind +
Supabase (Postgres/Auth/RLS) + Vitest + Playwright + GitHub Actions +
Vercel.

## Comandos clave
Ver README.md.

## Decisiones de arquitectura
Ver `docs/ARCHITECTURE.md`.

## Trabajo pendiente
Ver `docs/KNOWN_LIMITATIONS.md` (P1/P2) y `docs/HUMAN_ACTIONS.md` (bloqueos
externos).
