# Sell In Reconoce · v2

Plataforma de reconocimiento entre colaboradores para **Falabella Sell In**
(~100 personas). Créditos mensuales (no acumulables) para reconocer a otros
+ puntos acumulados en billetera (canjeables, expiran el 31 de diciembre).

**Stack:** Next.js 14 + TypeScript + Tailwind + Supabase (Postgres/Auth/RLS)
+ Vercel. UI con el design system Falabella "Neon" 2024 (verde `#ADD500`,
neón `#00F400`, Montserrat/Poppins/Bebas Neue).

---

## Cómo funciona el acceso (sin correos, sin Microsoft)

- El único login es **correo + contraseña** (Supabase Auth).
- **No se envía ningún correo**: el admin crea cada cuenta desde
  **Administración → Usuarios → Crear usuario**, definiendo la contraseña
  temporal ahí mismo, y se la entrega a la persona por el canal que quiera.
- Si alguien olvida su contraseña, el admin la restablece desde la misma
  pantalla (botón "Contraseña" en la fila del usuario).
- Cada persona puede cambiar su propia contraseña en **Mi perfil**.

## Flujo de trabajo (100% desde el navegador)

1. **Primera vez:** sube este proyecto a GitHub usando StackBlitz
   (importar carpeta → Source Control → Push). Solo se usa StackBlitz esa vez.
2. **Cambios posteriores:** edítalos **directo en GitHub** (tecla `.` en el
   repo abre el editor web, o el lápiz en cada archivo) → Commit.
3. **Vercel** está conectado al repo: cada commit a `main` **redespliega
   automáticamente** — el cambio queda en línea solo, en ~1 minuto.
4. **Base de datos:** cualquier cambio SQL se hace en el **SQL Editor de
   Supabase** (nunca hay que usar terminal ni CLI).

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Tipo | Para qué |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | pública | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | pública | Anon key (RLS protege los datos) |
| `SUPABASE_SERVICE_ROLE_KEY` | **secreta** | Crear usuarios y restablecer contraseñas desde el panel admin |

Después de agregar o cambiar variables: **Deployments → ⋯ → Redeploy**.

## Puesta en marcha de la base (una vez, SQL Editor)

1. Migraciones `supabase/migrations/0001` → `0004` en orden (ya aplicadas
   en el proyecto real).
2. `scripts/harden-jobs.sql` ← **nuevo en v2, obligatorio**: evita que
   usuarios normales puedan ejecutar los jobs mensuales por RPC.
3. `scripts/seed-production.sql` si faltan pilares/catálogo.
4. Si no hay período abierto, usa el botón **"Abrir período"** en
   Administración → Período (o configura pg_cron, paso 9 del
   `docs/DEPLOYMENT_GUIDE.md`).

## Estructura

```
app/(auth)/login          → login correo + contraseña
app/(app)/…               → dashboard, reconocer, feed, catálogo, billetera, perfil
app/(admin)/admin/…       → usuarios (crear/rol/estado/contraseña), pilares,
                            catálogo y canjes, período
components/               → header, tab bar móvil, avatar, chips, banderola
lib/actions/              → server actions (reconocer, canjes, admin)
lib/supabase/             → clientes browser / server / service-role
supabase/migrations/      → esquema, funciones y jobs (sin cambios en v2)
scripts/                  → SQL de operación (admin, seed, harden, diagnóstico)
docs/                     → guías de despliegue y operación
```

## Qué cambió en v2

- UI/UX completa con la marca Falabella (tokens del Design System oficial).
- Navegación persistente: header en desktop, tab bar inferior en móvil.
- Formulario de reconocer con buscador de personas, pilares como chips,
  montos rápidos y vista previa idéntica a la tarjeta del feed.
- **Creación manual de usuarios y reset de contraseñas desde el panel
  admin** (service role, cero correos) + cambio de contraseña en Mi perfil.
- Botón de respaldo "Abrir período" para no depender de pg_cron.
- Se eliminó todo lo de Microsoft Entra ID, invitaciones por correo,
  tests y dependencias sin uso. Menos archivos, build más liviano.
