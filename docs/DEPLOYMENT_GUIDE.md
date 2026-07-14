> **⚠️ Actualización v2 (julio 2026):** el login es únicamente
> **correo + contraseña**. Ignora en esta guía todo lo relativo a
> Microsoft Entra ID (paso 15), SMTP/invitaciones por correo y
> `/set-password`: los usuarios se crean y sus contraseñas se
> restablecen **desde la app** en Administración → Usuarios
> (ver `docs/ONBOARDING_USUARIOS.md`). Además ejecuta una vez
> `scripts/harden-jobs.sql` y agrega `SUPABASE_SERVICE_ROLE_KEY`
> en Vercel (ahora es requerida).

# Guía de despliegue — Sell In Reconoce

Esta guía asume que no tienes experiencia técnica previa con GitHub, Supabase
o Vercel. Sigue los pasos en orden.

## 0. Antes de empezar

Necesitas crear (si no los tienes):
- Una cuenta en [github.com](https://github.com)
- Una cuenta en [supabase.com](https://supabase.com)
- Una cuenta en [vercel.com](https://vercel.com)
- Node.js 20 o superior instalado en tu computador ([nodejs.org](https://nodejs.org))

## 1. Subir el código a GitHub

1. Crea un repositorio nuevo y **privado** en GitHub (botón "New repository").
2. En tu computador, dentro de la carpeta del proyecto:
   ```
   git init
   git add .
   git commit -m "Versión inicial Sell In Reconoce"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
   git push -u origin main
   ```

## 2. Crear el proyecto en Supabase

1. En Supabase, "New Project".
2. Elige nombre, contraseña de base de datos (guárdala en un gestor de
   contraseñas) y **región Sudamérica (São Paulo)** o la más cercana a Chile
   disponible, para mejor latencia.
3. Espera a que el proyecto termine de aprovisionarse (~2 minutos).

## 3. Obtener URL y keys de Supabase

1. Ve a Project Settings > API.
2. Copia:
   - **Project URL** → será `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → será `SUPABASE_SERVICE_ROLE_KEY` (¡nunca la
     compartas ni la subas a GitHub!)

## 4. Instalar y vincular Supabase CLI

En tu computador:
```
npm install -g supabase
supabase login
cd sell-in-reconoce
supabase link --project-ref TU-PROJECT-REF
```
El `project-ref` está en la URL del proyecto en Supabase (después de
`/project/`).

## 5. Aplicar las migraciones

```
supabase db push
```
Esto crea todas las tablas, funciones y políticas de RLS descritas en
`supabase/migrations/`.

## 6. Cargar datos de desarrollo (SOLO en un proyecto de desarrollo/prueba, nunca en producción)

1. Crea los usuarios de prueba en Authentication > Users > Add user, usando
   los correos de `supabase/seed.sql` (ej. `ana.perez@example.com`) y una
   contraseña de prueba.
2. Copia el UUID que Supabase asignó a cada usuario y reemplázalo en
   `supabase/seed.sql` en el campo `id` del perfil correspondiente.
3. Ejecuta:
   ```
   supabase db execute -f supabase/seed.sql
   ```

## 7. Crear el primer administrador (en producción real)

En producción no cargarás el seed. En su lugar:
1. La primera persona inicia sesión con Microsoft Entra ID (paso 12).
2. Se crea su perfil manualmente en la tabla `profiles` desde el SQL Editor
   de Supabase, con `role = 'admin'`.
3. Desde ahí, esa persona ya puede gestionar el resto desde el panel admin.

## 8. Configurar Storage (para fotos de perfil, si las usas)

1. Storage > Create bucket, nómbralo `avatars`, márcalo como público solo si
   las fotos no son sensibles (o privado + URLs firmadas si prefieres mayor
   control).

## 9. Configurar Cron (jobs mensuales/anuales)

1. Database > Extensions > habilita `pg_cron` y `pg_net`.
2. En el SQL Editor, programa los jobs (ajusta la hora a America/Santiago):
   ```sql
   select cron.schedule('open-monthly-period', '0 5 1 * *',
     $$select job_open_monthly_period(gen_random_uuid()::text)$$);
   select cron.schedule('close-monthly-period', '0 5 28-31 * *',
     $$select job_close_monthly_period(gen_random_uuid()::text)$$);
   select cron.schedule('expire-wallet-annually', '0 6 1 1 *',
     $$select job_expire_wallet_annually(gen_random_uuid()::text)$$);
   ```
   Ajusta el cron de cierre mensual a la lógica exacta de "último día del
   mes" que prefieras (pg_cron no tiene "último día" nativo — valida con tu
   equipo técnico si necesitas precisión exacta o una función auxiliar).

## 10. Configurar secretos

Ningún secreto va en el código. Todos se configuran como variables de
entorno (paso 13 y 18).

## 11. Crear el proyecto en Vercel

1. En Vercel, "Add New Project" → importa el repositorio de GitHub.
2. Framework preset: Next.js (se detecta automático).

## 12. Configurar variables de entorno por ambiente

En Vercel > Settings > Environment Variables, agrega (ver también
`.env.example` para el detalle de cada una):

| Variable | Público/Secreto | Ambiente |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Público | Todos |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Público | Todos |
| `SUPABASE_SERVICE_ROLE_KEY` | Secreto | Todos (solo servidor) |
| `NEXT_PUBLIC_APP_URL` | Público | Todos |
| `NEXT_PUBLIC_ENABLE_DEV_AUTH` | Público | Solo Preview/Development — en Production debe ser `false` |
| `AZURE_AD_CLIENT_ID` / `AZURE_AD_CLIENT_SECRET` / `AZURE_AD_TENANT_ID` | Secreto | Production (ver paso 21) |
| `TEAMS_WEBHOOK_URL` | Secreto | Production, opcional |

## 13. Configurar dominios

1. En Vercel > Settings > Domains, agrega tu dominio (ej.
   `reconoce.falabella.com`) y sigue las instrucciones de DNS.

## 14. Configurar redirect URLs de autenticación

En Supabase > Authentication > URL Configuration, agrega:
- `https://TU-DOMINIO/dashboard` (production)
- `https://*.vercel.app/dashboard` (previews, opcional)

## 15. Configurar Microsoft Entra ID (OPCIONAL — omite este paso si no tienes permisos de Azure)

Si decides no usar Entra ID (como en este piloto), tu login real es
correo + contraseña. Ve directo a `docs/ONBOARDING_USUARIOS.md` para dar
de alta a las personas reales. Si más adelante alguien con permisos de
Azure quiere habilitarlo:

1. Azure Portal > Entra ID > App registrations > New registration.
2. Redirect URI: `https://TU-PROJECT-REF.supabase.co/auth/v1/callback`.
3. Genera un Client Secret y copia Client ID, Client Secret y Tenant ID.
4. En Supabase > Authentication > Providers > Azure, pega esos tres valores
   y activa el provider.
5. En Vercel, define `NEXT_PUBLIC_ENABLE_MICROSOFT_AUTH=true` — el botón
   "Ingresar con Microsoft" aparece automáticamente en /login.

## 16. Configurar Teams (opcional)

1. Crea un Workflow de Teams con un webhook entrante.
2. Pega la URL en `TEAMS_WEBHOOK_URL`.
3. Sin esta variable, el sistema sigue funcionando normal — las
   notificaciones de Teams simplemente no se envían (modo mock/desactivado).

## 17. Ejecutar CI

Al hacer push a `main`, GitHub Actions corre lint, typecheck, tests y build
automáticamente (ver `.github/workflows/ci.yml`). Revisa la pestaña
"Actions" del repositorio.

## 18. Ejecutar smoke tests

Localmente, con el proyecto corriendo (`npm run dev`) y variables de entorno
de un proyecto Supabase de prueba:
```
npx playwright install
npx playwright test
```

## 19. Validar observabilidad

Revisa Vercel > Observability (logs y errores) y Supabase > Logs para
confirmar que no hay errores 500 tras el primer despliegue.

## 20. Crear un backup

En Supabase > Database > Backups, confirma que los backups automáticos
diarios estén activos (incluidos en la mayoría de los planes pagos).

## 21. Restaurar un backup (solo si es necesario)

Supabase > Database > Backups > selecciona el backup > Restore. Esto
sobreescribe la base actual — úsalo solo en una emergencia real y avisa al
equipo antes.

## 22. Ejecutar un rollback

En Vercel, ve a Deployments, encuentra el despliegue anterior estable y
haz clic en "Promote to Production".

## 23. Pasar de development a production

1. Confirma `NEXT_PUBLIC_ENABLE_DEV_AUTH=false` en Production.
2. Confirma que el seed de desarrollo (usuarios ficticios) **no** esté en la
   base de producción.
3. Confirma que Entra ID esté configurado y probado con al menos una cuenta
   real antes del piloto.

## 24. Checklist final

Ver `docs/PRODUCTION_CHECKLIST.md`.

---

## Notas importantes

- **No subas nunca** `.env.local` ni ningún archivo con `SUPABASE_SERVICE_ROLE_KEY`
  a GitHub. Verifica que `.env*.local` esté en `.gitignore`.
- Este código no fue instalado ni ejecutado por Claude en esta conversación
  (el entorno de esta sesión no tiene acceso a red para `npm install`). Antes
  de considerar el sistema listo, tu equipo debe:
  1. Instalar dependencias (`npm install`) y correr `npm run build` localmente
     o en CI para confirmar que compila sin errores.
  2. Ejecutar `npm run lint`, `npm run typecheck` y `npm run test`.
  3. Aplicar las migraciones en un proyecto Supabase de prueba y validar los
     tests SQL de `tests/sql/critical_rules.sql` con pgTAP.
  4. Correr el smoke test de Playwright contra ese entorno de prueba.
