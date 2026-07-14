# Sell In Reconoce

Plataforma interna de reconocimiento entre colaboradores para Falabella
Sell In. Cada persona recibe créditos mensuales (no acumulables) para
reconocer a otros; los puntos recibidos se acumulan en una billetera anual
canjeable por productos y beneficios.

## Stack

Next.js (App Router) + TypeScript strict + Tailwind + Supabase
(Postgres, Auth, RLS) + Vitest + Playwright + GitHub Actions + Vercel.

## Primeros pasos (desarrollo local)

```bash
npm install
cp .env.example .env.local   # completa con tus credenciales de Supabase
supabase link --project-ref TU-PROJECT-REF
supabase db push
supabase db execute -f supabase/seed.sql   # solo en proyecto de desarrollo
npm run dev
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Chequeo de tipos TypeScript |
| `npm run test` | Tests unitarios (Vitest) |
| `npx playwright test` | Smoke tests E2E |

## Documentación

- `docs/ARCHITECTURE.md` — decisiones de arquitectura
- `docs/DATA_MODEL.md` / `docs/ERD.md` — modelo de datos
- `docs/SECURITY.md` — controles de seguridad
- `docs/DEPLOYMENT_GUIDE.md` — **guía paso a paso para producción**
- `docs/ADMIN_AND_USER_MANUAL.md` — manual de uso
- `docs/HUMAN_ACTIONS.md` — qué falta que solo un humano puede hacer
- `docs/KNOWN_LIMITATIONS.md` — qué no está incluido y por qué
- `docs/PRODUCTION_CHECKLIST.md` — checklist final antes de salir a producción

## Estado de esta entrega

Código fuente completo del núcleo funcional (P0), no instalado ni
compilado en el entorno donde se generó (sin acceso a red). Ver
`docs/KNOWN_LIMITATIONS.md` antes de considerar el sistema listo.
