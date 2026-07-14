-- 1. Verifica si existe la organización (causa más probable de que el
--    trigger haya fallado silenciosamente: si esto no existe, el insert
--    del perfil viola la referencia a organization_id).
select id, name from organizations where id = '00000000-0000-0000-0000-000000000001';

-- 2. Si la consulta anterior no devuelve fila, créala primero:
insert into organizations (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Falabella Sell In')
on conflict (id) do nothing;

-- 3. Crea tu perfil directamente con el UUID real de tu usuario de Auth.
insert into profiles (
  id, organization_id, first_name, last_name, display_name, email,
  job_title, area, role, status
) values (
  '7a38b606-cb6c-4e09-8ba0-c06b8f5c1bce',
  '00000000-0000-0000-0000-000000000001',
  'Francisco',
  'Concha',
  'Francisco Concha',
  'fconcha@falabella.cl',
  'Administrador',
  'Sell In',
  'admin',
  'active'
)
on conflict (id) do update set
  role = 'admin',
  status = 'active';

-- 4. Verifica que quedó bien:
select id, email, display_name, role, status from profiles where email = 'fconcha@falabella.cl';
