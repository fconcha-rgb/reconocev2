# Limitaciones conocidas

Este documento existe para que nada se presente como terminado si no lo está.

## No incluido en esta entrega (P1 — siguiente prioridad)

- Importación masiva de usuarios por CSV con previsualización de errores
  (la gestión de usuarios en el admin es manual, uno a uno).
- Reacciones y comentarios en el feed.
- Exportación de datos a CSV desde el admin.
- Preferencias de notificación por usuario.
- Adapter de Teams: la tabla `notification_outbox` y el enqueue están
  implementados; falta el worker que efectivamente llama al webhook con
  reintentos/backoff (queda como punto de extensión, ver más abajo).

## No incluido (P2 — solo puntos de extensión, no implementados)

- Badges, niveles, rankings.
- Heurísticas de colusión (detección de patrones sospechosos de
  reconocimientos cruzados).
- Analytics avanzado más allá de los conteos básicos.
- Animaciones/celebraciones en el feed.
- Integración automática con RR.HH. o Calendar.

Para cada uno de estos, la tabla `feature_flags` permite activarlos
progresivamente cuando se implementen, sin requerir cambios estructurales
en el modelo de datos ya construido.

## Cosas que necesitan verificación antes de producción

- **No se ejecutó `npm install` ni `npm run build` en esta sesión** (sin
  acceso a red). El código está escrito y revisado manualmente, pero no
  hay evidencia de una compilación real — tu equipo debe correrla antes de
  dar el sistema por bueno.
- El job `close_monthly_period` usa una expresión cron aproximada
  (`28-31 * *`) para "último día del mes"; revisar con tu equipo si se
  necesita una función exacta de fin de mes.
- El adapter de Teams no se probó contra un webhook real (no hay
  credenciales configuradas en este entorno).
- La importación de fotos de perfil no está implementada.

## Analytics incluidos vs. pendientes

Incluidos (vía consultas directas en el admin, sin dashboard dedicado
todavía): participación, créditos asignados/usados, puntos emitidos, canjes
por estado. Pendiente: un dashboard visual con gráficos — hoy son consultas
tabulares.
