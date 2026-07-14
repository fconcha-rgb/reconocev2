# Checklist de producción

Marca cada ítem solo con evidencia real, no por suposición.

## Código
- [ ] `npm install` sin errores
- [ ] `npm run lint` sin errores
- [ ] `npm run typecheck` sin errores
- [ ] `npm run test` (Vitest) en verde
- [ ] `npm run build` exitoso
- [ ] Sin secretos en el historial de Git (`git log` + Gitleaks en CI)

## Base de datos
- [ ] Migraciones aplicadas en un proyecto Supabase limpio (`supabase db push`)
- [ ] Tests SQL críticos (pgTAP) en verde
- [ ] RLS verificado manualmente: un usuario de prueba no ve datos de otra
      organización, un colaborador no puede escribir en tablas de admin
- [ ] Backups automáticos activos

## Autenticación
- [ ] `NEXT_PUBLIC_ENABLE_DEV_AUTH=false` en producción
- [ ] Login con Microsoft Entra ID probado con al menos una cuenta real
- [ ] Allowlist de dominios de correo configurada y probada

## Negocio
- [ ] Primer administrador creado y validado
- [ ] Período del mes actual abierto con créditos asignados
- [ ] Pilares reales cargados (no solo los 5 de seed)
- [ ] Catálogo real cargado con costos en puntos definidos por el negocio
- [ ] Política de reembolso de canjes rechazados confirmada por RRHH/Legal

## Infraestructura
- [ ] Dominio propio conectado y con certificado válido
- [ ] Variables de entorno completas en Vercel (production y preview)
- [ ] Jobs de pg_cron programados y probados al menos una vez
- [ ] CI en verde en GitHub Actions

## Observabilidad
- [ ] Logs de Vercel y Supabase revisados tras el primer despliegue real
- [ ] Procedimiento de rollback probado al menos una vez (ver
      `docs/SUPPORT_RUNBOOK.md`)

## Clasificación final
Completa esta sección con evidencia real antes de decidir:
- **GO**: todos los ítems de Código, Base de datos y Autenticación marcados.
- **CONDITIONAL GO**: código y BD listos, pero falta Entra ID, dominio o
  aprobación corporativa.
- **NO-GO**: cualquier ítem de "Base de datos" o "Negocio" sin marcar.
