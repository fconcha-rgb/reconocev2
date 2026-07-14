-- 0002_functions.sql
-- Funciones SQL transaccionales. Toda escritura financiera pasa por aquí.
-- SECURITY DEFINER con search_path fijo, ejecutan con privilegios elevados
-- pero validan explícitamente permisos y reglas de negocio.

-- ─────────────────────────────────────────────────────────────
-- create_recognition: débito de créditos + crédito de puntos + registro,
-- todo en una sola transacción con locking para evitar double-spend.
-- ─────────────────────────────────────────────────────────────

create or replace function create_recognition(
  p_receiver_id uuid,
  p_pillar_id uuid,
  p_amount int,
  p_message text,
  p_idempotency_key text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender_id uuid := auth.uid();
  v_org uuid;
  v_period record;
  v_balance record;
  v_pillar record;
  v_receiver record;
  v_recognition_id uuid;
  v_year int;
begin
  if v_sender_id is null then
    raise exception 'not_authenticated';
  end if;

  if v_sender_id = p_receiver_id then
    raise exception 'self_recognition_not_allowed';
  end if;

  select organization_id into v_org from profiles where id = v_sender_id and status = 'active';
  if v_org is null then
    raise exception 'sender_not_active';
  end if;

  select * into v_receiver from profiles
    where id = p_receiver_id and organization_id = v_org and status = 'active';
  if v_receiver is null then
    raise exception 'receiver_invalid_or_inactive';
  end if;

  select * into v_pillar from pillars
    where id = p_pillar_id and organization_id = v_org and is_active = true;
  if v_pillar is null then
    raise exception 'pillar_invalid_or_inactive';
  end if;

  v_year := extract(year from now())::int;
  select * into v_period from periods
    where organization_id = v_org
      and year = v_year
      and month = extract(month from now())::int
      and status = 'open'
    for update;
  if v_period is null then
    raise exception 'period_closed_or_not_found';
  end if;

  if p_amount < v_period.min_recognition_amount then
    raise exception 'amount_below_minimum';
  end if;

  if p_message is null or char_length(trim(p_message)) = 0 then
    raise exception 'message_required';
  end if;

  -- Lock del saldo del emisor para evitar concurrencia (doble clic, dos pestañas)
  select * into v_balance from giving_credit_balances
    where period_id = v_period.id and profile_id = v_sender_id
    for update;
  if v_balance is null or v_balance.balance < p_amount then
    raise exception 'insufficient_credit_balance';
  end if;

  -- Idempotencia: si ya existe esta key, retorna el reconocimiento existente
  if exists (select 1 from giving_ledger where idempotency_key = p_idempotency_key) then
    select reference_id into v_recognition_id from giving_ledger
      where idempotency_key = p_idempotency_key;
    return v_recognition_id;
  end if;

  insert into recognitions (organization_id, period_id, sender_id, receiver_id, pillar_id, amount, message)
    values (v_org, v_period.id, v_sender_id, p_receiver_id, p_pillar_id, p_amount, p_message)
    returning id into v_recognition_id;

  update giving_credit_balances set balance = balance - p_amount, updated_at = now()
    where period_id = v_period.id and profile_id = v_sender_id;

  insert into giving_ledger (period_id, profile_id, amount, reason, reference_id, idempotency_key)
    values (v_period.id, v_sender_id, -p_amount, 'recognition', v_recognition_id, p_idempotency_key);

  insert into wallet_balances (profile_id, year, balance)
    values (p_receiver_id, v_year, p_amount)
    on conflict (profile_id) do update
      set balance = wallet_balances.balance + p_amount, updated_at = now(), year = v_year;

  insert into wallet_ledger (profile_id, year, amount, reason, reference_id, idempotency_key)
    values (p_receiver_id, v_year, p_amount, 'recognition', v_recognition_id, p_idempotency_key || ':wallet');

  insert into notifications (profile_id, type, title, body, deep_link, metadata)
    values (
      p_receiver_id, 'recognition_received', 'Recibiste un reconocimiento',
      left(p_message, 140), '/feed?recognition=' || v_recognition_id,
      jsonb_build_object('amount', p_amount, 'pillar_id', p_pillar_id)
    );

  insert into notification_outbox (channel, payload)
    values ('teams', jsonb_build_object('recognition_id', v_recognition_id, 'receiver_id', p_receiver_id));

  insert into audit_log (organization_id, actor_id, action, entity, entity_id, metadata)
    values (v_org, v_sender_id, 'create_recognition', 'recognition', v_recognition_id,
      jsonb_build_object('amount', p_amount, 'receiver_id', p_receiver_id));

  return v_recognition_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- redeem_catalog_item: valida saldo/stock/vigencia, descuenta ambos de forma
-- atómica, idempotente.
-- ─────────────────────────────────────────────────────────────

create or replace function redeem_catalog_item(
  p_catalog_item_id uuid,
  p_idempotency_key text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid := auth.uid();
  v_org uuid;
  v_item record;
  v_wallet record;
  v_year int := extract(year from now())::int;
  v_redemption_id uuid;
  v_status redemption_status;
  v_period_count int;
begin
  if v_profile_id is null then
    raise exception 'not_authenticated';
  end if;

  if exists (select 1 from redemptions where idempotency_key = p_idempotency_key) then
    select id into v_redemption_id from redemptions where idempotency_key = p_idempotency_key;
    return v_redemption_id;
  end if;

  select organization_id into v_org from profiles where id = v_profile_id and status = 'active';
  if v_org is null then
    raise exception 'profile_not_active';
  end if;

  select * into v_item from catalog_items
    where id = p_catalog_item_id and organization_id = v_org and is_active = true
    for update;
  if v_item is null then
    raise exception 'item_not_available';
  end if;

  if v_item.valid_from is not null and current_date < v_item.valid_from then
    raise exception 'item_not_yet_valid';
  end if;
  if v_item.valid_until is not null and current_date > v_item.valid_until then
    raise exception 'item_expired';
  end if;

  if v_item.max_per_user_per_period is not null then
    select count(*) into v_period_count from redemptions
      where profile_id = v_profile_id and catalog_item_id = p_catalog_item_id
        and status not in ('rejected', 'cancelled')
        and date_trunc('month', created_at) = date_trunc('month', now());
    if v_period_count >= v_item.max_per_user_per_period then
      raise exception 'redemption_limit_reached';
    end if;
  end if;

  select * into v_wallet from wallet_balances where profile_id = v_profile_id for update;
  if v_wallet is null or v_wallet.balance < v_item.points_cost then
    raise exception 'insufficient_wallet_balance';
  end if;

  if not v_item.is_unlimited_stock then
    if v_item.stock is null or v_item.stock < 1 then
      raise exception 'out_of_stock';
    end if;
    update catalog_items set stock = stock - 1 where id = v_item.id;
  end if;

  v_status := case when v_item.requires_approval then 'pending' else 'approved' end;

  insert into redemptions (organization_id, profile_id, catalog_item_id, points_spent, status, idempotency_key)
    values (v_org, v_profile_id, p_catalog_item_id, v_item.points_cost, v_status, p_idempotency_key)
    returning id into v_redemption_id;

  update wallet_balances set balance = balance - v_item.points_cost, updated_at = now()
    where profile_id = v_profile_id;

  insert into wallet_ledger (profile_id, year, amount, reason, reference_id, idempotency_key)
    values (v_profile_id, v_year, -v_item.points_cost, 'redemption', v_redemption_id, p_idempotency_key || ':wallet');

  insert into notifications (profile_id, type, title, body, deep_link)
    values (v_profile_id, 'redemption_created', 'Canje registrado', v_item.name, '/billetera?redemption=' || v_redemption_id);

  insert into audit_log (organization_id, actor_id, action, entity, entity_id, metadata)
    values (v_org, v_profile_id, 'redeem_catalog_item', 'redemption', v_redemption_id,
      jsonb_build_object('catalog_item_id', p_catalog_item_id, 'points', v_item.points_cost));

  return v_redemption_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- resolve_redemption: admin aprueba/rechaza/cancela. Reembolsa
-- exactamente una vez si corresponde (idempotente vía chequeo de estado).
-- ─────────────────────────────────────────────────────────────

create or replace function resolve_redemption(
  p_redemption_id uuid,
  p_new_status redemption_status,
  p_reason text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := auth.uid();
  v_redemption record;
  v_item record;
begin
  if not auth_is_admin() then
    raise exception 'not_authorized';
  end if;

  select * into v_redemption from redemptions where id = p_redemption_id for update;
  if v_redemption is null then
    raise exception 'redemption_not_found';
  end if;

  if v_redemption.status in ('rejected', 'cancelled', 'delivered') then
    -- Ya está en un estado terminal: no reprocesar (evita doble reembolso)
    return;
  end if;

  if p_new_status in ('rejected', 'cancelled') then
    select * into v_item from catalog_items where id = v_redemption.catalog_item_id for update;

    update wallet_balances set balance = balance + v_redemption.points_spent, updated_at = now()
      where profile_id = v_redemption.profile_id;

    insert into wallet_ledger (profile_id, year, amount, reason, reference_id, idempotency_key)
      values (
        v_redemption.profile_id, extract(year from now())::int, v_redemption.points_spent,
        'refund', v_redemption.id, 'refund:' || v_redemption.id::text
      );

    if v_item is not null and not v_item.is_unlimited_stock then
      update catalog_items set stock = coalesce(stock, 0) + 1 where id = v_item.id;
    end if;
  end if;

  update redemptions set status = p_new_status, decided_by = v_admin_id,
    decision_reason = p_reason, updated_at = now()
    where id = p_redemption_id;

  insert into audit_log (organization_id, actor_id, action, entity, entity_id, metadata)
    values (v_redemption.organization_id, v_admin_id, 'resolve_redemption', 'redemption', p_redemption_id,
      jsonb_build_object('new_status', p_new_status, 'reason', p_reason));
end;
$$;
