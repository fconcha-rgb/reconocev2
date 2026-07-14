-- 0003_jobs.sql
-- Jobs idempotentes. Se invocan desde pg_cron o desde un Edge Function
-- programado. Cada uno registra su ejecución en job_runs y es seguro de
-- reintentar: una ejecución duplicada no debe duplicar movimientos.

create or replace function job_open_monthly_period(p_request_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org record;
  v_period_id uuid;
  v_run_id uuid;
  v_year int := extract(year from now())::int;
  v_month int := extract(month from now())::int;
  v_profile record;
begin
  insert into job_runs (job_name, request_id) values ('open_monthly_period', p_request_id)
    returning id into v_run_id;

  for v_org in select id from organizations loop
    select id into v_period_id from periods
      where organization_id = v_org.id and year = v_year and month = v_month;

    if v_period_id is null then
      insert into periods (organization_id, year, month, status, opened_at)
        values (v_org.id, v_year, v_month, 'open', now())
        returning id into v_period_id;
    else
      -- Ya existe (reintento): no duplicar, solo asegurar que quede abierto.
      update periods set status = 'open', opened_at = coalesce(opened_at, now())
        where id = v_period_id and status <> 'open';
    end if;

    for v_profile in
      select id from profiles where organization_id = v_org.id and status = 'active'
    loop
      insert into giving_credit_balances (period_id, profile_id, allocated, balance)
        select v_period_id, v_profile.id, p.default_credits, p.default_credits
        from periods p where p.id = v_period_id
        on conflict (period_id, profile_id) do nothing; -- idempotente

      insert into giving_ledger (period_id, profile_id, amount, reason, idempotency_key)
        select v_period_id, v_profile.id, p.default_credits, 'allocation',
          'alloc:' || v_period_id::text || ':' || v_profile.id::text
        from periods p where p.id = v_period_id
        on conflict (idempotency_key) do nothing; -- idempotente
    end loop;
  end loop;

  update job_runs set status = 'success', finished_at = now() where id = v_run_id;
end;
$$;

create or replace function job_close_monthly_period(p_request_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run_id uuid;
  v_period record;
begin
  insert into job_runs (job_name, request_id) values ('close_monthly_period', p_request_id)
    returning id into v_run_id;

  for v_period in select * from periods where status = 'open' loop
    -- Expira créditos no usados (no pasan al mes siguiente)
    insert into giving_ledger (period_id, profile_id, amount, reason, idempotency_key)
      select b.period_id, b.profile_id, -b.balance, 'expiration',
        'expire:' || b.period_id::text || ':' || b.profile_id::text
      from giving_credit_balances b
      where b.period_id = v_period.id and b.balance > 0
      on conflict (idempotency_key) do nothing;

    update giving_credit_balances set balance = 0, updated_at = now()
      where period_id = v_period.id and balance > 0;

    update periods set status = 'closed', closed_at = now() where id = v_period.id;
  end loop;

  update job_runs set status = 'success', finished_at = now() where id = v_run_id;
end;
$$;

create or replace function job_expire_wallet_annually(p_request_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run_id uuid;
  v_current_year int := extract(year from now())::int;
  v_row record;
begin
  insert into job_runs (job_name, request_id) values ('expire_wallet_annually', p_request_id)
    returning id into v_run_id;

  -- Solo debe ejecutarse el 31 de diciembre / 1 de enero. Idempotente por año.
  for v_row in
    select * from wallet_balances
    where year < v_current_year and balance > 0
  loop
    insert into wallet_ledger (profile_id, year, amount, reason, idempotency_key)
      values (v_row.profile_id, v_row.year, -v_row.balance, 'expiration',
        'wallet_expire:' || v_row.profile_id::text || ':' || v_row.year::text)
      on conflict (idempotency_key) do nothing;

    update wallet_balances set balance = 0, year = v_current_year, updated_at = now()
      where profile_id = v_row.profile_id;
  end loop;

  update job_runs set status = 'success', finished_at = now() where id = v_run_id;
end;
$$;
