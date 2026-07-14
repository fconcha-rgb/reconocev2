-- seed-production.sql
-- Para el proyecto REAL del piloto. NO incluye personas ficticias.
-- Ejecutar en el SQL Editor de Supabase, DESPUÉS de correr
-- scripts/create-first-admin.sql.

-- 1. Pilares reales de Falabella Sell In.
--    Puedes editar nombres/descripciones aquí antes de correr, o después
--    desde el panel admin (Admin > Pilares) — no es necesario que quede
--    perfecto ahora.
insert into pillars (organization_id, name, description, icon, color_token, sort_order) values
  ('00000000-0000-0000-0000-000000000001', 'Customer Centric', 'Pone al cliente en el centro de cada decisión', 'heart', 'primary', 1),
  ('00000000-0000-0000-0000-000000000001', 'Ownership', 'Se hace cargo y toma responsabilidad', 'flag', 'primary', 2),
  ('00000000-0000-0000-0000-000000000001', 'Colaboración', 'Trabaja con otros para lograr más', 'users', 'primary', 3),
  ('00000000-0000-0000-0000-000000000001', 'Innovación', 'Propone nuevas formas de resolver problemas', 'lightbulb', 'primary', 4),
  ('00000000-0000-0000-0000-000000000001', 'Agilidad', 'Se adapta rápido y ejecuta con velocidad', 'zap', 'primary', 5);

-- 2. Catálogo inicial real.
--    Ajusta nombres, costos en puntos y stock a lo que el negocio defina.
--    También editable después desde Admin > Catálogo.
insert into catalog_items (organization_id, name, description, type, category, points_cost, stock, is_unlimited_stock, is_active, requires_approval) values
  ('00000000-0000-0000-0000-000000000001', 'Día libre', 'Un día libre a elección, sujeto a aprobación de tu jefatura', 'day_off', 'Beneficios', 1500, null, true, true, true),
  ('00000000-0000-0000-0000-000000000001', 'Gift card Falabella $20.000', 'Tarjeta de regalo para usar en tiendas Falabella', 'gift_card', 'Gift cards', 2000, 50, false, true, false),
  ('00000000-0000-0000-0000-000000000001', 'Almuerzo con el equipo', 'Vale de almuerzo para compartir con tu equipo', 'experience', 'Experiencias', 800, 100, false, true, false),
  ('00000000-0000-0000-0000-000000000001', 'Home office 1 semana', 'Trabaja desde casa toda una semana', 'flexible_benefit', 'Beneficios', 500, null, true, true, false),
  ('00000000-0000-0000-0000-000000000001', 'Merchandising Sell In', 'Polerón y accesorios de la marca Sell In', 'physical', 'Merchandising', 300, 30, false, true, false);

-- 3. Abre el período del mes actual y asigna créditos a quienes ya tengan
--    perfil creado (por ahora, solo tú como primer admin). A medida que
--    se agreguen más personas reales, hay dos formas de darles créditos:
--    a) esperar al próximo job mensual automático (si configuraste pg_cron), o
--    b) volver a ejecutar esta misma función manualmente aquí en el SQL Editor:
--       select job_open_monthly_period(gen_random_uuid()::text);
--    Es idempotente: no duplica asignaciones para quien ya las tenga.
select job_open_monthly_period(gen_random_uuid()::text);
