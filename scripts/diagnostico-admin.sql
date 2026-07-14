-- ¿Cuántas cuentas de Auth existen con ese correo (sin importar mayúsculas)?
select id, email, created_at from auth.users where email ilike '%fconcha%';

-- ¿Cuántos perfiles existen con ese correo (sin importar mayúsculas)?
select id, email, role, status, created_at from profiles where email ilike '%fconcha%';
