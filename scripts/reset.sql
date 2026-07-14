-- reset.sql
-- Borra TODO lo creado por las migraciones 0001-0004, para volver a
-- correrlas desde cero. Ejecutar en el SQL Editor de Supabase.
--
-- NO toca auth.users (las personas invitadas siguen existiendo en
-- Authentication > Users). Si también quieres borrarlas, hazlo manualmente
-- ahí — nunca se borran solas por seguridad.

-- Trigger y función de auto-perfil (0004)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_auth_user();

-- Funciones de jobs (0003)
drop function if exists job_expire_wallet_annually(text);
drop function if exists job_close_monthly_period(text);
drop function if exists job_open_monthly_period(text);

-- Funciones transaccionales (0002)
drop function if exists resolve_redemption(uuid, redemption_status, text);
drop function if exists redeem_catalog_item(uuid, text);
drop function if exists create_recognition(uuid, uuid, int, text, text);

-- Helpers de RLS (0001)
drop function if exists auth_is_admin();
drop function if exists auth_profile_org();

-- Tablas (0001) — cascade se encarga de policies, índices y FKs
drop table if exists feature_flags cascade;
drop table if exists audit_log cascade;
drop table if exists job_runs cascade;
drop table if exists notification_outbox cascade;
drop table if exists notifications cascade;
drop table if exists redemptions cascade;
drop table if exists catalog_items cascade;
drop table if exists wallet_ledger cascade;
drop table if exists wallet_balances cascade;
drop table if exists recognitions cascade;
drop table if exists giving_ledger cascade;
drop table if exists giving_credit_balances cascade;
drop table if exists periods cascade;
drop table if exists pillars cascade;
drop table if exists profiles cascade;
drop table if exists organizations cascade;

-- Tipos enum (0001)
drop type if exists redemption_status;
drop type if exists reward_type;
drop type if exists period_status;
drop type if exists user_status;
drop type if exists user_role;

-- Nota: no se elimina la extensión pgcrypto, es inofensiva dejarla activa.
