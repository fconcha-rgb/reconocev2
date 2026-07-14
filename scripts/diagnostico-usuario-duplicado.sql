-- Diagnóstico: ¿ya existe este correo en auth.users y/o en profiles?
select id, email, created_at from auth.users where email = 'fconcha@falabella.cl';
select id, email, created_at from profiles where email = 'fconcha@falabella.cl';
