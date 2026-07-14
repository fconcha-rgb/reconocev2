-- Crear el PRIMER ADMINISTRADOR REAL (no ficticio).
-- Ejecutar en el SQL Editor de Supabase, en un proyecto donde ya corriste
-- las migraciones (0001, 0002, 0003).

-- 1. Asegura que la organización exista (no falla si ya existe).
insert into organizations (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Falabella Sell In')
on conflict (id) do nothing;

-- 2. Crea tu perfil como admin, usando el UUID real que te dio Supabase Auth
--    al crear tu usuario (Authentication > Users > Add user, con
--    fconcha@falabella.cl).
--    Edita "first_name", "last_name", "display_name", "job_title" y "area"
--    con tus datos reales antes de ejecutar.
insert into profiles (
  id, organization_id, first_name, last_name, display_name, email,
  job_title, area, role, status
) values (
  'd1227dee-244b-4495-a07f-9f38c9905329',
  '00000000-0000-0000-0000-000000000001',
  'Francisco',            -- edita: tu nombre
  'Concha',               -- edita: tu apellido
  'Francisco Concha',     -- edita: tu nombre visible
  'fconcha@falabella.cl',
  'Administrador',        -- edita: tu cargo real
  'Sell In',              -- edita: tu área real
  'admin',
  'active'
)
on conflict (id) do update set
  role = 'admin',
  status = 'active';
