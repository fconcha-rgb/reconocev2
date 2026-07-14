-- harden-jobs.sql
-- EJECUTAR UNA VEZ en el SQL Editor de Supabase (proyecto de producción).
--
-- Problema: por defecto Postgres da EXECUTE a PUBLIC en las funciones, y
-- PostgREST las expone como RPC. Eso significa que CUALQUIER usuario
-- autenticado podría llamar job_close_monthly_period() y expirar los
-- créditos de todo el equipo. Este script deja los jobs solo para
-- service_role (los usa pg_cron y el botón "Abrir período" del panel admin).

revoke execute on function job_open_monthly_period(text) from public, anon, authenticated;
revoke execute on function job_close_monthly_period(text) from public, anon, authenticated;
revoke execute on function job_expire_wallet_annually(text) from public, anon, authenticated;

grant execute on function job_open_monthly_period(text) to service_role;
grant execute on function job_close_monthly_period(text) to service_role;
grant execute on function job_expire_wallet_annually(text) to service_role;

-- Verificación rápida (debe mostrar solo service_role además del owner):
-- select proname, proacl from pg_proc where proname like 'job_%';
