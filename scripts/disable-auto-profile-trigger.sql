-- Desactiva el trigger sin borrarlo (se puede reactivar después).
alter table auth.users disable trigger on_auth_user_created;

-- Para reactivarlo más adelante, una vez corregido el problema de fondo:
-- alter table auth.users enable trigger on_auth_user_created;
