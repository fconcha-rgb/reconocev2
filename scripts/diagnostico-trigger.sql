-- ¿Cuántos triggers hay sobre auth.users con este nombre? (debería ser 1)
select tgname, tgenabled, pg_get_triggerdef(oid) as definition
from pg_trigger
where tgrelid = 'auth.users'::regclass
  and tgname = 'on_auth_user_created';

-- ¿La función tiene el bloque "exception when others"? (debería aparecer
-- la palabra "exception" en el resultado)
select pg_get_functiondef(oid) as definition
from pg_proc
where proname = 'handle_new_auth_user';

-- ¿Existe la organización que el trigger necesita para insertar el perfil?
select id, name from organizations where id = '00000000-0000-0000-0000-000000000001';
