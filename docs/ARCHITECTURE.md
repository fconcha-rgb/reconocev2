# Arquitectura

## Principio
Una sola aplicación Next.js modular + PostgreSQL (Supabase) como fuente
transaccional de verdad. Sin microservicios: no se justifican para ~100
usuarios escalando a algunos miles.

## Capas
1. **UI (Server/Client Components)** — sin autoridad sobre saldos; solo
   presenta datos ya validados por RLS y envía intenciones (formularios).
2. **Server Actions** — validan forma de los datos con Zod, llaman a
   funciones SQL, traducen errores a mensajes legibles. No contienen lógica
   financiera.
3. **Funciones SQL `SECURITY DEFINER`** — única capa donde ocurre lógica
   financiera: validan reglas de negocio, hacen locking (`for update`),
   actualizan ledgers + saldos materializados de forma atómica, e
   idempotente vía `idempotency_key`.
4. **RLS** — deny-by-default, es la barrera de autorización real,
   independiente de lo que la UI muestre u oculte.

## Por qué ledger + saldo materializado (y no solo una columna)
Una columna de saldo editable directamente es una fuente de verdad frágil:
cualquier bug o carrera de escrituras concurrentes puede corromperla sin
dejar rastro. Con un ledger inmutable, el saldo materializado siempre puede
reconstruirse y auditarse contra la suma de movimientos — eso es lo que
permite detectar y corregir diferencias (reconciliación).

## Multi-tenencia
Todo registro de negocio lleva `organization_id`. El piloto usa una sola
organización, pero el modelo ya soporta separar por organización sin
cambios estructurales, para cuando el producto crezca más allá de Sell In.

## Desacoplamiento de integraciones
Teams (`notification_outbox`) y Entra ID (adapter de Auth) están aislados
del núcleo: si no están configurados, el sistema sigue funcionando
completo — solo esas integraciones quedan en modo mock/desactivado.
