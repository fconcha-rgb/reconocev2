# Onboarding de usuarios (v2 — sin correos)

Todo el ciclo de vida de las cuentas se maneja **dentro de la app**, en
**Administración → Usuarios**. No se usa el motor de correos de Supabase
ni el panel de Authentication para el día a día.

## Crear una cuenta

1. Entra a la app con tu cuenta admin → menú del avatar → Administración.
2. En **Crear usuario** completa nombre, apellido, correo, cargo/área y rol.
3. Usa **Generar** para una contraseña temporal segura (o escribe una).
4. **Crear usuario** → la cuenta queda activa al instante (correo ya
   confirmado, créditos del mes asignados si el período está abierto).
5. Pulsa **Copiar credenciales** y envíaselas a la persona por Teams,
   WhatsApp o en persona. Sugiérele cambiarla en **Mi perfil** al entrar.

## Si alguien olvida su contraseña

En la fila del usuario → **Contraseña** → Generar → Guardar → entrégale la
nueva. (Nada de links de recuperación por correo.)

## Desactivar / reactivar

Botón **Desactivar** en la fila. Un usuario inactivo no puede ingresar a
nada (middleware + RLS) y no aparece en el buscador de "Reconocer", pero su
historial se conserva.

## Roles

- **Colaborador:** reconoce, canjea, ve el feed.
- **Admin:** todo lo anterior + panel de administración. Cámbialo con el
  selector de la fila.

## Notas técnicas

- La creación usa `auth.admin.createUser` con `email_confirm: true` vía la
  `SUPABASE_SERVICE_ROLE_KEY` (solo servidor). Cada acción privilegiada
  verifica primero que quien la llama sea admin activo.
- El trigger `handle_new_auth_user()` crea el perfil base y la acción lo
  completa (cargo, área, rol) y asigna los créditos del período abierto con
  las mismas claves idempotentes del job mensual.
