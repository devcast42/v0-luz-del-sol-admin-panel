-- 1. Tabla Tasks (Kanban)
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  client_id uuid,
  assigned_to uuid,
  status text NOT NULL DEFAULT 'TODO'::text CHECK (status = ANY (ARRAY['TODO'::text, 'IN_PROGRESS'::text, 'DONE'::text])),
  due_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.usuarios(id)
);

-- 2. Tabla Caja Diaria (Arqueo)
CREATE TABLE IF NOT EXISTS public.caja_diaria (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fecha date NOT NULL UNIQUE,
  monto_apertura numeric NOT NULL DEFAULT 0,
  monto_cierre_fisico numeric,
  ingresos_registrados numeric DEFAULT 0,
  egresos_registrados numeric DEFAULT 0,
  diferencia numeric,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT caja_diaria_pkey PRIMARY KEY (id),
  CONSTRAINT caja_diaria_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.usuarios(id)
);

-- 3. Tabla Recurring Expenses
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  categoria_id uuid NOT NULL,
  descripcion text,
  monto numeric NOT NULL,
  moneda text NOT NULL DEFAULT 'PEN'::text CHECK (moneda = ANY (ARRAY['PEN'::text, 'USD'::text])),
  frecuencia text NOT NULL DEFAULT 'MONTHLY'::text CHECK (frecuencia = ANY (ARRAY['WEEKLY'::text, 'MONTHLY'::text, 'YEARLY'::text])),
  next_due_date date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT recurring_expenses_pkey PRIMARY KEY (id),
  CONSTRAINT recurring_expenses_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias_egreso(id)
);

-- 4. Disable RLS for ease of use in admin panel (or you can create policies later)
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.caja_diaria DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses DISABLE ROW LEVEL SECURITY;
