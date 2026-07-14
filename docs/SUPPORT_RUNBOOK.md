# Runbook de soporte

## "Un colaborador dice que no le llegaron sus créditos del mes"
1. Revisa `periods` — ¿existe un período `open` para el mes/organización?
2. Revisa `giving_credit_balances` para ese `profile_id` y `period_id`.
3. Si falta, el job `job_open_monthly_period` no corrió o falló — revisa
   `job_runs` por su `request_id` y el campo `error`.
4. Nunca asignes créditos manualmente por UPDATE directo — usa una entrada
   correctiva en `giving_ledger` con `reason = 'reversal'` y luego
   actualiza el saldo materializado en la misma transacción, para no
   romper la reconciliación.

## "Un canje quedó pendiente y nadie lo aprueba"
Panel admin > Catálogo > sección de canjes pendientes.

## "Necesito revertir un reconocimiento indebido"
No lo borres. Usa `resolve_redemption`-style: crea un proceso equivalente
para reconocimientos (marca `is_hidden = true`, registra
`moderation_reason`, y evalúa si corresponde una entrada reversa en el
ledger del receptor según la política de RRHH — ver
`docs/HUMAN_ACTIONS.md` punto 4).

## "Los puntos de alguien no expiraron el 1 de enero"
Revisa que `job_expire_wallet_annually` haya corrido (`job_runs`). Es
idempotente: puedes volver a ejecutarlo manualmente sin riesgo de duplicar
la expiración.

## Rollback de un despliegue
Vercel > Deployments > selecciona el despliegue estable anterior >
"Promote to Production". No requiere cambios en la base de datos si no
hubo migraciones nuevas en ese despliegue.

## Restaurar backup de base de datos
Supabase > Database > Backups > Restore. Acción destructiva: coordina con
el equipo antes de ejecutar.
