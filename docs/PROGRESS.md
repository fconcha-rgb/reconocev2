# PROGRESS.md

## Estado: núcleo P0 entregado como código fuente (no compilado/ejecutado en esta sesión)

### Completado
- Esquema completo de base de datos con RLS deny-by-default (0001)
- Funciones transaccionales: reconocer, canjear, resolver canje (0002)
- Jobs idempotentes: apertura/cierre de período, expiración anual (0003)
- Seed de desarrollo con datos ficticios
- Auth dev (email/password) + adapter Entra ID
- Middleware de protección de rutas admin
- Páginas: dashboard, reconocer, feed, billetera, catálogo, perfil
- Panel admin: usuarios, pilares, catálogo + aprobación de canjes, períodos
- Tests: unitarios (Zod), SQL críticos (pgTAP), smoke E2E (Playwright)
- CI (GitHub Actions): lint, typecheck, test, build, secret scanning
- Documentación completa (ver README.md para el índice)

### Pendiente (ver docs/KNOWN_LIMITATIONS.md para detalle)
- P1: importación CSV, reacciones/comentarios, worker real de Teams,
  exportación CSV, preferencias de notificación
- P2: badges, rankings, analytics avanzado, animaciones, integraciones
  automáticas con RR.HH./Calendar

### Acciones humanas pendientes
Ver docs/HUMAN_ACTIONS.md — Entra ID, Design System oficial, aprobación de
políticas de RRHH/Legal, Teams, dominio.

### Próximos pasos recomendados
1. `npm install` + `npm run build` para confirmar compilación real.
2. Aplicar migraciones en un proyecto Supabase de prueba.
3. Correr tests SQL (pgTAP) y smoke E2E contra ese entorno.
4. Reemplazar `docs/TEST_RESULTS.md` con resultados reales.
5. Seguir `docs/DEPLOYMENT_GUIDE.md` para producción.
