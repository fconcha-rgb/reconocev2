# Seguridad

## RLS (Row Level Security)

Todas las tablas expuestas tienen RLS habilitado con **deny-by-default**:
no existe policy = nadie fuera del service role puede leer/escribir. Ver
`supabase/migrations/0001_init.sql`.

- `job_runs` y `notification_outbox` no tienen policies para
  `anon`/`authenticated`: solo el service role (usado exclusivamente en
  servidor, nunca en el navegador) puede tocarlas.
- Separación estricta por `organization_id` en todas las tablas de negocio.
- Helpers `auth_profile_org()` y `auth_is_admin()` (`SECURITY DEFINER`, con
  `search_path` fijo) evitan repetir subconsultas inseguras en cada policy.

## Defensa en profundidad

La autorización se valida en **tres capas independientes**, no solo en la
interfaz:
1. RLS en la base de datos (la barrera real).
2. Middleware (`middleware.ts`) redirige antes de renderizar rutas de admin.
3. Las funciones SQL `SECURITY DEFINER` validan explícitamente rol/estado
   antes de cualquier escritura financiera.

Ocultar un botón en la UI nunca se considera control de acceso.

## Secretos

- `SUPABASE_SERVICE_ROLE_KEY` solo existe como variable de entorno de
  servidor (nunca `NEXT_PUBLIC_`) y solo se usa en scripts de jobs/admin,
  nunca en código que atienda una request de usuario sin revalidar rol.
- `.env.example` documenta cada variable; `.env.local` está en `.gitignore`.
- CI incluye secret scanning (Gitleaks) y dependency audit.

## Validación y sanitización

- Toda entrada de formularios pasa por esquemas Zod (`lib/validations.ts`)
  antes de llegar a una Server Action o función SQL.
- Headers de seguridad (CSP, X-Frame-Options, etc.) configurados en
  `next.config.mjs`.

## Datos personales

Los perfiles almacenan el mínimo necesario (nombre, correo corporativo,
cargo, área, equipo). No se almacenan RUT, datos de salud ni información
financiera personal. Seeds y tests usan exclusivamente datos ficticios.

## Pendiente de validar con el equipo de seguridad de Falabella

- Rate limiting a nivel de Vercel/Edge (no incluido por defecto en Next.js;
  evaluar Vercel Firewall o un middleware de rate limiting).
- Revisión de la política de allowlist de dominios de Entra ID.
- Confirmación de si se requiere un Data Processing Agreement adicional
  para el proveedor de Storage (fotos de perfil).
