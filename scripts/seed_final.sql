-- 1. Agregar la columna de image_url si no existe en la tabla properties
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Insertar un cliente de prueba si no hay
INSERT INTO public.clients (id, full_name, email, phone, status, lead_source)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Juan Perez (Cliente Prueba)', 'juanp@example.com', '+51999888777', 'NEW', 'WhatsApp')
ON CONFLICT DO NOTHING;

-- 3. Insertar un proyecto de prueba
INSERT INTO public.projects (id, name, description, location, status)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'Residencial Los Sauces', 'Hermoso proyecto a las afueras de la ciudad', 'Valle Sur', 'Active')
ON CONFLICT DO NOTHING;

-- 4. Insertar una propiedad/terreno de prueba
INSERT INTO public.properties (id, project_id, code, title, description, property_type, location, area, price, status)
VALUES 
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'LOTE-A1', 'Lote Esquina', 'Excelente lote en esquina con doble fachada', 'Lote', 'Manzana A, Lote 1', 120.50, 45000.00, 'Disponible')
ON CONFLICT DO NOTHING;

-- 5. Obtener un UUID de usuario (Para que las citas funcionen, necesitamos el ID de algun ASESOR existente)
-- Reemplaza 'TU_UUID_DE_ASESOR' con tu propio UUID de Supabase Auth si deseas verlo logeado con tu cuenta, o dejamos esto para llenarlo manualmente en el panel.

-- 6. Insertar algunas interacciones falsas para probar el modal de "Ver Conversaciones"
-- Desactivar RLS momentáneamente para insertar (Vuelve a activarlo después si lo necesitas)
ALTER TABLE public.interactions DISABLE ROW LEVEL SECURITY;

INSERT INTO public.interactions (id, client_id, user_id, type, notes, scheduled_at)
VALUES 
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', null, 'bot', 'Hola, soy el asistente virtual de Luz del Sol. ¿En qué puedo ayudarte?', now() - interval '2 days'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', null, 'system', 'El cliente solicitó información sobre el Lote Esquina.', now() - interval '1 days'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', null, 'message', 'Me gustaría agendar una visita presencial.', now() - interval '12 hours')
ON CONFLICT DO NOTHING;
