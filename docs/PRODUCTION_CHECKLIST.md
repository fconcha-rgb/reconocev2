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
- [ ] Método de login definido: Entra ID **o** correo+contraseña (este
      piloto usa correo+contraseña — `NEXT_PUBLIC_ENABLE_DEV_AUTH=true`,
      `NEXT_PUBLIC_ENABLE_MICROSOFT_AUTH=false`)
- [ ] Trigger `0004_auto_profile_on_signup.sql` aplicado
- [ ] SMTP propio configurado (Resend/SendGrid) si vas a invitar a muchas personas
- [ ] Al menos una persona real invitada y probada de punta a punta

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
- **CONDITIONAL GO**: código y BD listos, pero falta dominio propio o
  aprobación corporativa (Entra ID ya no aplica si se decidió usar
  correo+contraseña).
- **NO-GO**: cualquier ítem de "Base de datos" o "Negocio" sin marcar.
