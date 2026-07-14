# Contexto del proyecto: Sell In Reconoce (v2)

Adjunta este documento junto con el zip del proyecto al iniciar un chat
nuevo para continuar sin perder contexto.

## Qué es

Plataforma de reconocimiento entre colaboradores de Falabella Sell In
(~100 personas). Créditos mensuales no acumulables para reconocer +
puntos en billetera (canjeables, expiran 31 dic). Next.js 14 + TS +
Tailwind + Supabase (Postgres/Auth/RLS) + Vercel.

## Estado: producción real

- Supabase: migraciones `0001`–`0004` aplicadas vía SQL Editor.
- GitHub conectado (subida inicial vía StackBlitz; cambios se editan
  directo en GitHub). Vercel redespliega automático con cada commit.
- Admin real: `fconcha@falabella.cl` (Auth UUID
  `7a38b606-cb6c-4e09-8ba0-c06b8f5c1bce`).

## v2 (rediseño completo) — julio 2026

- **UI/UX con el design system Falabella "Neon" 2024**: verde `#ADD500`
  (banderola, tags de pilar, progreso), neón `#00F400` (acentos; los
  puntos SIEMPRE van neón-sobre-negro), botones pill negros con hover a
  neón, Montserrat/Poppins/Bebas Neue vía `next/font` (self-hosted por CSP).
- **Navegación persistente**: header desktop + tab bar inferior móvil con
  acción central "Reconocer". Shell en `app/(app)/layout.tsx` y
  `app/(admin)/layout.tsx`.
- **Login único: correo + contraseña.** Se eliminó Microsoft Entra ID,
  flags `NEXT_PUBLIC_ENABLE_DEV_AUTH` / `NEXT_PUBLIC_ENABLE_MICROSOFT_AUTH`,
  `/auth/callback` y `/set-password`.
- **Usuarios se crean DESDE la app** (Administración → Usuarios): server
  action con `SUPABASE_SERVICE_ROLE_KEY` (ahora variable REQUERIDA en
  Vercel) usando `auth.admin.createUser({ email_confirm: true })` — cero
  correos. Incluye reset de contraseña por admin y cambio de contraseña
  propio en Mi perfil. Toda acción privilegiada valida admin activo
  (`lib/actions/admin.ts → requireAdmin`).
- Al crear un usuario se le asignan los créditos del período abierto con
  las mismas claves idempotentes del job (`alloc:{period}:{profile}`).
- **Botón "Abrir período"** en Administración → Período (llama
  `job_open_monthly_period` con service role) como respaldo de pg_cron.
- **`scripts/harden-jobs.sql` (PENDIENTE DE EJECUTAR si no se ha hecho):**
  revoca EXECUTE de los `job_*` a usuarios normales; sin esto cualquier
  autenticado podría cerrar el período por RPC.
- Aligerado: sin tests/vitest/CI, sin react-hook-form, date-fns, clsx,
  tailwind-merge. Deps: supabase (ssr+js), next, react, zod, lucide-react.
- Migraciones y funciones SQL **sin cambios** en v2.

## Pendientes conocidos

1. Ejecutar `scripts/harden-jobs.sql` en el SQL Editor (una vez).
2. Agregar `SUPABASE_SERVICE_ROLE_KEY` en Vercel y redesplegar.
3. Configurar pg_cron (paso 9 de DEPLOYMENT_GUIDE) o usar el botón
   manual de período cada mes.
4. Crear a las ~100 personas desde Administración → Usuarios.

## Cómo seguir trabajando

Editar en GitHub → commit → Vercel redespliega. SQL en el SQL Editor.
Nunca se usa terminal ni Git local. Si aparece un error en producción,
pegar el mensaje exacto o el log de Vercel para diagnosticar.
