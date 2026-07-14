# Acciones humanas requeridas (HUMAN_ACTIONS.md)

Ninguna de estas fue ni pudo ser completada automáticamente. Cada una indica
qué se necesita, quién debe obtenerlo/hacerlo, dónde y cómo validarlo.

## 1. Cuentas y credenciales de infraestructura
- **Qué**: cuentas de GitHub, Supabase y Vercel para el proyecto.
- **Quién**: la persona owner del proyecto (tú) o el equipo de TI.
- **Dónde**: github.com, supabase.com, vercel.com.
- **Cómo validar**: ver `docs/DEPLOYMENT_GUIDE.md` pasos 1–13.

## 2. Microsoft Entra ID
- **Qué**: registro de app, client ID/secret, tenant ID, allowlist de dominios.
- **Quién**: administrador del tenant de Microsoft de Falabella.
- **Dónde**: Azure Portal > Entra ID > App registrations.
- **Cómo validar**: login real con una cuenta corporativa de prueba antes
  del piloto.

## 3. Falabella Design System — tokens oficiales
- **Qué**: colores, tipografía, logo, íconos y componentes oficiales de
  marca. Esta entrega usa una capa de tokens placeholder sobria y
  reemplazable (`tailwind.config.ts`, bloque `brand`).
- **Quién**: equipo de Diseño/Marca de Falabella.
- **Dónde**: reemplazar únicamente los valores en `tailwind.config.ts` →
  objeto `brand` (colores) y el logo en `app/layout.tsx` / componentes de
  header (a crear cuando se entreguen los assets).
- **Cómo validar**: revisión visual del equipo de Diseño contra el manual
  de marca real.

## 4. Aprobación de políticas corporativas
- **Qué**: confirmación de RRHH/Legal sobre las reglas de expiración de
  puntos (31 dic), mínimo de reconocimiento, y política de reembolso de
  canjes rechazados/cancelados (implementada como reembolso total e
  idempotente — confirmar que esta es la política deseada).
- **Quién**: RRHH / Legal Falabella.
- **Dónde**: revisión de `docs/DATA_MODEL.md` y las funciones en
  `0002_functions.sql`.

## 5. Teams
- **Qué**: webhook/workflow de Teams para notificaciones externas.
- **Quién**: administrador de Teams de Falabella.
- **Dónde**: Teams > Workflows > Webhook entrante → pegar URL en
  `TEAMS_WEBHOOK_URL`.
- **Cómo validar**: sin esta variable, el sistema funciona igual; las
  notificaciones simplemente no salen de la plataforma (modo mock).

## 6. Dominio propio
- **Qué**: dominio corporativo (ej. `reconoce.falabella.com`) y su DNS.
- **Quién**: equipo de infraestructura/dominios de Falabella.
- **Dónde**: Vercel > Settings > Domains.

## 7. Fotos de perfil / Storage
- **Qué**: decidir si las fotos de perfil se sincronizan desde el
  directorio corporativo (Entra ID/Graph) o se suben manualmente. No
  implementado en el piloto — placeholder de avatar.
