# CLAUDE.md

Contexto para retomar este proyecto en una sesión nueva de Claude/Claude Code.

## Qué es esto
Sell In Reconoce: plataforma de reconocimiento y recompensas para ~100
colaboradores de Falabella Sell In, inspirada funcionalmente en WorkTango.
Ver `docs/PROJECT_MAP.md` para la estructura completa y `docs/PROGRESS.md`
para el estado de avance.

## Reglas de negocio no negociables (no reinterpretar)
1. Créditos para reconocer ≠ puntos para canjear. Dos saldos independientes,
   cada uno con ledger inmutable + saldo materializado.
2. Créditos: mensuales, editables por admin, no acumulan mes a mes, mínimo
   editable (default 100) por reconocimiento, no se autorreconoce.
3. Puntos: se acumulan al año calendario, expiran 31 de diciembre.
4. Toda escritura financiera pasa por una función SQL `SECURITY DEFINER`
   transaccional con idempotency key. Nunca editar saldos directo desde la
   app o desde una migración manual.
5. RLS deny-by-default en todo. Nunca agregar una tabla sin política
   explícita o sin dejarla intencionalmente sin acceso de cliente.

## Convenciones
- Server Components por defecto; Client Components solo con interactividad.
- Validación de entrada con Zod antes de cualquier Server Action.
- Nombres de archivos y commits en español donde ya existan en español;
  código (variables, funciones) en inglés.

## Antes de dar por terminada cualquier tarea
Correr (o confirmar que se corrió): lint, typecheck, tests unitarios, build.
No declarar algo "listo" sin evidencia real de estos resultados.
