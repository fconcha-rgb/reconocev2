-- 0001_init.sql
-- Esquema base de Sell In Reconoce. Deny-by-default en todas las tablas.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- ORGANIZACIONES Y PERFILES
-- ─────────────────────────────────────────────────────────────

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create type user_role as enum ('collaborator', 'admin');
create type user_status as enum ('active', 'inactive');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references organizations(id),
  first_name text not null,
  last_name text not null,
  display_name text not null,
  email text not null unique,
  avatar_url text,
  job_title text,
  area text,
  team text,
  manager_id uuid references profiles(id),
  role user_role not null default 'collaborator',
  status user_status not null default 'active',
  timezone text not null default 'America/Santiago',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_organization_idx on profiles(organization_id);

-- ─────────────────────────────────────────────────────────────
-- PILARES (administrables)
-- ─────────────────────────────────────────────────────────────

create table pillars (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  name text not null,
  description text,
  icon text,
  color_token text not null default 'primary',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- PERÍODOS Y ASIGNACIÓN DE CRÉDITOS
-- ─────────────────────────────────────────────────────────────

create type period_status as enum ('open', 'closed');

create table periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  year int not null,
  month int not null check (month between 1 and 12),
  status period_status not null default 'open',
  default_credits int not null default 2000 check (default_credits >= 0),
  min_recognition_amount int not null default 100 check (min_recognition_amount >= 1),
  opened_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, year, month)
);

-- Créditos para reconocer, por persona y período. Fuente de verdad = ledger,
-- esta tabla es el saldo MATERIALIZADO (no editar directo desde la app).
create table giving_credit_balances (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references periods(id),
  profile_id uuid not null references profiles(id),
  allocated int not null default 0 check (allocated >= 0),
  balance int not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now(),
  unique (period_id, profile_id)
);

-- Ledger inmutable de créditos para reconocer (asignación y débito por dar).
create table giving_ledger (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references periods(id),
  profile_id uuid not null references profiles(id),
  amount int not null, -- positivo = asignación, negativo = débito por reconocer
  reason text not null, -- 'allocation' | 'recognition' | 'reversal' | 'expiration'
  reference_id uuid, -- id del reconocimiento u otro origen
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- RECONOCIMIENTOS
-- ─────────────────────────────────────────────────────────────

create table recognitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  period_id uuid not null references periods(id),
  sender_id uuid not null references profiles(id),
  receiver_id uuid not null references profiles(id),
  pillar_id uuid not null references pillars(id),
  amount int not null check (amount > 0),
  message text not null check (char_length(message) between 1 and 500),
  is_hidden boolean not null default false,
  moderation_reason text,
  created_at timestamptz not null default now(),
  check (sender_id <> receiver_id)
);

create index recognitions_org_idx on recognitions(organization_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- BILLETERA (puntos recibidos, expiran 31-dic)
-- ─────────────────────────────────────────────────────────────

create table wallet_balances (
  profile_id uuid primary key references profiles(id),
  year int not null,
  balance int not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id),
  year int not null,
  amount int not null, -- positivo = recibido, negativo = canje/expiración
  reason text not null, -- 'recognition' | 'redemption' | 'refund' | 'expiration' | 'reversal'
  reference_id uuid,
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- CATÁLOGO Y CANJES
-- ─────────────────────────────────────────────────────────────

create type reward_type as enum ('physical', 'gift_card', 'experience', 'flexible_benefit', 'day_off', 'other');
create type redemption_status as enum ('pending', 'approved', 'rejected', 'processing', 'ready', 'delivered', 'cancelled');

create table catalog_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  name text not null,
  description text,
  image_url text,
  type reward_type not null,
  category text,
  points_cost int not null check (points_cost > 0),
  stock int, -- null = ilimitado
  is_unlimited_stock boolean not null default false,
  valid_from date,
  valid_until date,
  is_active boolean not null default true,
  terms text,
  requires_approval boolean not null default false,
  max_per_user_per_period int,
  owner_profile_id uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table redemptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  profile_id uuid not null references profiles(id),
  catalog_item_id uuid not null references catalog_items(id),
  points_spent int not null check (points_spent > 0),
  status redemption_status not null default 'pending',
  idempotency_key text not null unique,
  decided_by uuid references profiles(id),
  decision_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- NOTIFICACIONES IN-APP
-- ─────────────────────────────────────────────────────────────

create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id),
  type text not null,
  title text not null,
  body text,
  deep_link text,
  metadata jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- OUTBOX (notificaciones externas / Teams) Y JOBS
-- ─────────────────────────────────────────────────────────────

create table notification_outbox (
  id uuid primary key default gen_random_uuid(),
  channel text not null default 'teams',
  payload jsonb not null,
  status text not null default 'pending', -- pending | sent | failed | dead_letter
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table job_runs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running', -- running | success | failed
  records_processed int not null default 0,
  error text,
  request_id text not null,
  metadata jsonb not null default '{}'
);

-- ─────────────────────────────────────────────────────────────
-- AUDITORÍA Y FEATURE FLAGS
-- ─────────────────────────────────────────────────────────────

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  actor_id uuid references profiles(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table feature_flags (
  key text primary key,
  organization_id uuid references organizations(id),
  is_enabled boolean not null default false,
  description text
);

-- ─────────────────────────────────────────────────────────────
-- RLS: deny-by-default en todo
-- ─────────────────────────────────────────────────────────────

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table pillars enable row level security;
alter table periods enable row level security;
alter table giving_credit_balances enable row level security;
alter table giving_ledger enable row level security;
alter table recognitions enable row level security;
alter table wallet_balances enable row level security;
alter table wallet_ledger enable row level security;
alter table catalog_items enable row level security;
alter table redemptions enable row level security;
alter table notifications enable row level security;
alter table notification_outbox enable row level security;
alter table job_runs enable row level security;
alter table audit_log enable row level security;
alter table feature_flags enable row level security;

-- Helper: organización y rol del usuario autenticado actual
create or replace function auth_profile_org() returns uuid
language sql stable security definer set search_path = public as $$
  select organization_id from profiles where id = auth.uid();
$$;

create or replace function auth_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

-- profiles: cada quien ve su organización; solo admin edita otros perfiles
create policy profiles_select on profiles for select
  using (organization_id = auth_profile_org());
create policy profiles_update_self on profiles for update
  using (id = auth.uid());
create policy profiles_admin_all on profiles for all
  using (auth_is_admin() and organization_id = auth_profile_org());

create policy pillars_select on pillars for select
  using (organization_id = auth_profile_org());
create policy pillars_admin_write on pillars for all
  using (auth_is_admin() and organization_id = auth_profile_org());

create policy periods_select on periods for select
  using (organization_id = auth_profile_org());
create policy periods_admin_write on periods for all
  using (auth_is_admin() and organization_id = auth_profile_org());

create policy giving_balance_select_self on giving_credit_balances for select
  using (profile_id = auth.uid() or auth_is_admin());
-- Escritura de saldos SOLO vía funciones SECURITY DEFINER (no policy de insert/update directo)

create policy giving_ledger_select_self on giving_ledger for select
  using (profile_id = auth.uid() or auth_is_admin());

create policy recognitions_select on recognitions for select
  using (organization_id = auth_profile_org() and (is_hidden = false or auth_is_admin()));
-- Insert de reconocimientos SOLO vía función transaccional (ver 0002)

create policy wallet_balance_select_self on wallet_balances for select
  using (profile_id = auth.uid() or auth_is_admin());

create policy wallet_ledger_select_self on wallet_ledger for select
  using (profile_id = auth.uid() or auth_is_admin());

create policy catalog_select on catalog_items for select
  using (organization_id = auth_profile_org() and (is_active = true or auth_is_admin()));
create policy catalog_admin_write on catalog_items for all
  using (auth_is_admin() and organization_id = auth_profile_org());

create policy redemptions_select_self on redemptions for select
  using (profile_id = auth.uid() or (auth_is_admin() and organization_id = auth_profile_org()));
create policy redemptions_admin_update on redemptions for update
  using (auth_is_admin() and organization_id = auth_profile_org());

create policy notifications_select_self on notifications for select
  using (profile_id = auth.uid());
create policy notifications_update_self on notifications for update
  using (profile_id = auth.uid());

create policy audit_admin_select on audit_log for select
  using (auth_is_admin() and organization_id = auth_profile_org());

create policy flags_select on feature_flags for select
  using (organization_id = auth_profile_org() or organization_id is null);
create policy flags_admin_write on feature_flags for all
  using (auth_is_admin());

-- job_runs y notification_outbox: sin acceso desde cliente (solo service role)
-- No se crean policies de select/insert para roles anon/authenticated —
-- permanecen deny-by-default; el service role bypassa RLS desde el servidor.
