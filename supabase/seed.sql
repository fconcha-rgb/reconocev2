-- seed.sql — SOLO desarrollo. Datos 100% ficticios.
-- Ejecutar con: supabase db reset (aplica migraciones + este seed)

-- NOTA: los usuarios de auth.users deben crearse vía Supabase Auth (no aquí).
-- Este seed asume que ya ejecutaste scripts/seed-users.ts (ver DEPLOYMENT_GUIDE.md)
-- que crea los usuarios de auth y captura sus UUIDs antes de correr este seed.
-- Como alternativa simple, usa el placeholder de UUIDs deterministas de abajo
-- y crea usuarios de Auth con esos mismos UUIDs usando la Admin API.

insert into organizations (id, name) values
  ('00000000-0000-0000-0000-000000000001', 'Falabella Sell In');

-- Pilares
insert into pillars (organization_id, name, description, icon, color_token, sort_order) values
  ('00000000-0000-0000-0000-000000000001', 'Customer Centric', 'Pone al cliente en el centro de cada decisión', 'heart', 'primary', 1),
  ('00000000-0000-0000-0000-000000000001', 'Ownership', 'Se hace cargo y toma responsabilidad', 'flag', 'primary', 2),
  ('00000000-0000-0000-0000-000000000001', 'Colaboración', 'Trabaja con otros para lograr más', 'users', 'primary', 3),
  ('00000000-0000-0000-0000-000000000001', 'Innovación', 'Propone nuevas formas de resolver problemas', 'lightbulb', 'primary', 4),
  ('00000000-0000-0000-0000-000000000001', 'Agilidad', 'Se adapta rápido y ejecuta con velocidad', 'zap', 'primary', 5);

-- Perfiles ficticios (16 personas: 2 admin + 14 colaboradores).
-- Reemplaza estos UUIDs por los reales que devuelva Supabase Auth al crear
-- cada usuario (ver scripts/seed-users.ts).
insert into profiles (id, organization_id, first_name, last_name, display_name, email, job_title, area, role, status) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Ana', 'Pérez', 'Ana Pérez', 'ana.perez@example.com', 'Gerente Sell In', 'Sell In', 'admin', 'active'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Bruno', 'Soto', 'Bruno Soto', 'bruno.soto@example.com', 'Coordinador RRHH', 'RRHH', 'admin', 'active'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Carla', 'Muñoz', 'Carla Muñoz', 'carla.munoz@example.com', 'Analista Comercial', 'Comercial', 'collaborator', 'active'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Diego', 'Rojas', 'Diego Rojas', 'diego.rojas@example.com', 'Ejecutivo de Cuenta', 'Comercial', 'collaborator', 'active'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Elena', 'Torres', 'Elena Torres', 'elena.torres@example.com', 'Analista de Datos', 'Operaciones', 'collaborator', 'active'),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Felipe', 'Castro', 'Felipe Castro', 'felipe.castro@example.com', 'Ejecutivo de Cuenta', 'Comercial', 'collaborator', 'active'),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Gabriela', 'Fuentes', 'Gabriela Fuentes', 'gabriela.fuentes@example.com', 'Analista Marketing', 'Marketing', 'collaborator', 'active'),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Hugo', 'Vargas', 'Hugo Vargas', 'hugo.vargas@example.com', 'Especialista Logística', 'Operaciones', 'collaborator', 'active'),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'Isidora', 'Reyes', 'Isidora Reyes', 'isidora.reyes@example.com', 'Ejecutiva de Cuenta', 'Comercial', 'collaborator', 'active'),
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Javier', 'Morales', 'Javier Morales', 'javier.morales@example.com', 'Analista Financiero', 'Finanzas', 'collaborator', 'active'),
  ('10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Karen', 'Silva', 'Karen Silva', 'karen.silva@example.com', 'Coordinadora Comercial', 'Comercial', 'collaborator', 'active'),
  ('10000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Luis', 'Herrera', 'Luis Herrera', 'luis.herrera@example.com', 'Analista TI', 'Tecnología', 'collaborator', 'active'),
  ('10000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'María', 'Contreras', 'María Contreras', 'maria.contreras@example.com', 'Ejecutiva de Cuenta', 'Comercial', 'collaborator', 'active'),
  ('10000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Nicolás', 'Espinoza', 'Nicolás Espinoza', 'nicolas.espinoza@example.com', 'Analista Operaciones', 'Operaciones', 'collaborator', 'active'),
  ('10000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'Olivia', 'Sepúlveda', 'Olivia Sepúlveda', 'olivia.sepulveda@example.com', 'Especialista UX', 'Tecnología', 'collaborator', 'active'),
  ('10000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', 'Pedro', 'Araya', 'Pedro Araya', 'pedro.araya@example.com', 'Ejecutivo de Cuenta', 'Comercial', 'collaborator', 'active');

-- Período abierto del mes actual
insert into periods (id, organization_id, year, month, status, default_credits, min_recognition_amount, opened_at)
values (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  extract(year from now())::int,
  extract(month from now())::int,
  'open', 2000, 100, now()
);

-- Asignación de créditos a todos
insert into giving_credit_balances (period_id, profile_id, allocated, balance)
select '20000000-0000-0000-0000-000000000001', id, 2000, 2000 from profiles;

insert into giving_ledger (period_id, profile_id, amount, reason, idempotency_key)
select '20000000-0000-0000-0000-000000000001', id, 2000, 'allocation',
  'seed_alloc:' || id::text
from profiles;

-- Catálogo de ejemplo
insert into catalog_items (organization_id, name, description, type, category, points_cost, stock, is_unlimited_stock, is_active, requires_approval) values
  ('00000000-0000-0000-0000-000000000001', 'Día libre', 'Un día libre a elección, sujeto a aprobación de tu jefatura', 'day_off', 'Beneficios', 1500, null, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'Gift card Falabella $20.000', 'Tarjeta de regalo para usar en tiendas Falabella', 'gift_card', 'Gift cards', 2000, 50, false, true, false),
  ('00000000-0000-0000-0000-000000000001', 'Almuerzo con el equipo', 'Vale de almuerzo para compartir con tu equipo', 'experience', 'Experiencias', 800, 100, false, true, false),
  ('00000000-0000-0000-0000-000000000001', 'Home office 1 semana', 'Trabaja desde casa toda una semana', 'flexible_benefit', 'Beneficios', 500, null, true, true, false),
  ('00000000-0000-0000-0000-000000000001', 'Merchandising Sell In', 'Polerón y accesorios de la marca Sell In', 'physical', 'Merchandising', 300, 30, false, true, false);

-- Un par de reconocimientos de ejemplo (vía función, respeta reglas de negocio)
-- Nota: estos inserts directos son SOLO para seed inicial de datos de feed;
-- en producción todo reconocimiento pasa por create_recognition().
