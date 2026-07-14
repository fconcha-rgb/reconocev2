-- 0004_auto_profile_on_signup.sql
-- Ejecutar en el SQL Editor de Supabase, DESPUÉS de 0001/0002/0003 y de
-- crear tu propio admin (scripts/create-first-admin.sql).
--
-- Sin esto, cada vez que invitas a alguien nuevo tendrías que insertar su
-- fila en "profiles" a mano. Con este trigger, apenas se crea el usuario
-- en Supabase Auth (por invitación o registro), se crea automáticamente
-- su perfil como "collaborator" activo. Tú (admin) después ajustas nombre,
-- cargo, área y rol desde el panel admin o el SQL Editor si hace falta.

create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, organization_id, first_name, last_name, display_name, email, role, status)
  values (
    new.id,
    '00000000-0000-0000-0000-000000000001', -- organización única del piloto
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email,
    'collaborator',
    'active'
  )
  on conflict (id) do nothing; -- si ya existe (ej. tu admin creado a mano), no lo pisa
  return new;
exception
  when others then
    -- Nunca dejar que un problema al crear el perfil (ej. correo duplicado
    -- por una carrera de datos, columna inesperada, etc.) bloquee la
    -- creación del usuario de Auth. Si esto pasa, el usuario de Auth se
    -- crea igual y tú completas/corriges su perfil a mano después.
    raise warning 'No se pudo crear el perfil automático para %: %', new.email, sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();
