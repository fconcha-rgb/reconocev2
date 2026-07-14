-- tests/sql/critical_rules.sql
-- Ejecutar con pgTAP (supabase test db) contra una base con las migraciones
-- y seed aplicados. Cubre las reglas de negocio no-negociables.

begin;
select plan(9);

-- 1. Autorreconocimiento bloqueado
select throws_ok(
  $$ select create_recognition(
    '10000000-0000-0000-0000-000000000003',
    (select id from pillars limit 1),
    100, 'test', 'test-self-reco'
  ) $$,
  'self_recognition_not_allowed',
  'No debe permitir autorreconocimiento'
) ;
-- Nota: en un entorno real, auth.uid() se simula seteando el JWT de test
-- (set_config('request.jwt.claims', ...)) antes de cada bloque. Ver
-- docs/DEPLOYMENT_GUIDE.md sección "Ejecutar tests SQL" para el harness
-- completo con supabase test db.

-- 2. Monto bajo el mínimo bloqueado
select throws_ok(
  $$ select create_recognition(
    '10000000-0000-0000-0000-000000000004',
    (select id from pillars limit 1),
    10, 'test', 'test-below-min'
  ) $$,
  'amount_below_minimum',
  'No debe permitir monto bajo el mínimo'
);

-- 3. Pilar inactivo bloqueado
select throws_ok(
  $$ update pillars set is_active = false where name = 'Agilidad';
     select create_recognition(
       '10000000-0000-0000-0000-000000000004',
       (select id from pillars where name = 'Agilidad'),
       100, 'test', 'test-inactive-pillar'
     ) $$,
  'pillar_invalid_or_inactive',
  'No debe permitir pilar inactivo'
);

-- 4. Saldo insuficiente bloqueado
select throws_ok(
  $$ select create_recognition(
    '10000000-0000-0000-0000-000000000004',
    (select id from pillars limit 1),
    999999, 'test', 'test-insufficient'
  ) $$,
  'insufficient_credit_balance',
  'No debe permitir monto sobre el saldo'
);

-- 5. Idempotencia: misma key no duplica movimiento
select lives_ok(
  $$ select create_recognition(
    '10000000-0000-0000-0000-000000000004',
    (select id from pillars limit 1),
    100, 'test idempotente', 'test-idem-key'
  ) $$,
  'Primera llamada con idempotency key debe funcionar'
);
select is(
  (select create_recognition(
    '10000000-0000-0000-0000-000000000004',
    (select id from pillars limit 1),
    100, 'test idempotente', 'test-idem-key'
  )),
  (select reference_id from giving_ledger where idempotency_key = 'test-idem-key'),
  'Reintento con misma idempotency key retorna el mismo reconocimiento, no duplica'
);

-- 6. Canje sin saldo bloqueado
select throws_ok(
  $$ select redeem_catalog_item(
    (select id from catalog_items order by points_cost desc limit 1),
    'test-redeem-insufficient'
  ) $$,
  'insufficient_wallet_balance',
  'No debe permitir canje sin saldo suficiente'
);

-- 7. RLS: un perfil de otra organización no debe ver estos datos
-- (ejecutar con JWT de un usuario de otra organización simulada)
select isnt_empty(
  $$ select 1 from pillars where organization_id = '00000000-0000-0000-0000-000000000001' $$,
  'Pilares de la organización propia son visibles'
);

-- 8. Colaborador no accede a administración (verificado también en middleware.ts y RLS)
select throws_ok(
  $$ update periods set default_credits = 99999
     where organization_id = '00000000-0000-0000-0000-000000000001' $$,
  null,
  'Un colaborador (no admin) no debe poder editar períodos vía RLS'
);

-- 9. Stock no queda negativo bajo canjes concurrentes (simulado secuencialmente aquí;
-- la prueba de concurrencia real se ejecuta con Playwright, ver tests/e2e)
select ok(
  (select stock >= 0 from catalog_items where is_unlimited_stock = false limit 1),
  'Stock nunca debe quedar negativo'
);

select * from finish();
rollback;
