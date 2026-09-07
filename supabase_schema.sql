-- =============================================================================
-- IEANJESÚS MALDONADO — ESQUEMA DE BASE DE DATOS Y MIGRACIÓN INICIAL (SUPABASE)
-- =============================================================================
-- Este script es idempotente (se puede ejecutar múltiples veces de forma segura).
-- Crea las tablas, triggers de actualización, funciones de autorización,
-- políticas RLS (Row Level Security) y siembra los datos reales del proyecto.
-- =============================================================================

-- 1. TABLA DE ADMINISTRADORES AUTORIZADOS
-- Solo los usuarios aquí registrados tendrán permisos de escritura (INSERT, UPDATE, DELETE).
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FUNCIÓN DE SEGURIDAD PARA VALIDAR SI EL USUARIO AUTENTICADO ES ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
  );
$$;

-- 3. FUNCIÓN TRIGGER PARA ACTUALIZAR AUTOMÁTICAMENTE updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLAS DE CONTENIDO DE LA IGLESIA
-- =============================================================================

-- A. AVISOS TEMPORALES (notices)
CREATE TABLE IF NOT EXISTS public.notices (
    id TEXT PRIMARY KEY,
    title TEXT,
    text TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tr_notices_updated_at ON public.notices;
CREATE TRIGGER tr_notices_updated_at
    BEFORE UPDATE ON public.notices
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- B. HORARIOS DE CULTOS EN TEMPLO CENTRAL (schedules)
CREATE TABLE IF NOT EXISTS public.schedules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    day TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT DEFAULT 'templo',
    short_desc TEXT,
    full_desc TEXT,
    organizer TEXT,
    target TEXT,
    what_to_expect TEXT,
    display_order INT DEFAULT 0,
    visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tr_schedules_updated_at ON public.schedules;
CREATE TRIGGER tr_schedules_updated_at
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- C. RED DE 8 CÉLULAS DE HOGAR (cells)
CREATE TABLE IF NOT EXISTS public.cells (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    day TEXT NOT NULL,
    time TEXT NOT NULL,
    zone TEXT NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    image TEXT,
    phone TEXT NOT NULL,
    whatsapp_text TEXT NOT NULL,
    whatsapp_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tr_cells_updated_at ON public.cells;
CREATE TRIGGER tr_cells_updated_at
    BEFORE UPDATE ON public.cells
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- D. AGENDA Y PRÓXIMAS ACTIVIDADES (events)
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT DEFAULT 'Actividad',
    description TEXT,
    public BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tr_events_updated_at ON public.events;
CREATE TRIGGER tr_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- E. CATÁLOGO DE MATERIAL GRATUITO (resources)
CREATE TABLE IF NOT EXISTS public.resources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    file_type TEXT DEFAULT 'PDF',
    external_url TEXT,
    display_order INT DEFAULT 0,
    visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tr_resources_updated_at ON public.resources;
CREATE TRIGGER tr_resources_updated_at
    BEFORE UPDATE ON public.resources
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- F. EMPRENDIMIENTOS DE NUESTRA COMUNIDAD (businesses)
CREATE TABLE IF NOT EXISTS public.businesses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    link_type TEXT DEFAULT 'WhatsApp',
    phone TEXT,
    url TEXT,
    whatsapp_url TEXT,
    logo_text TEXT,
    logo TEXT,
    display_order INT DEFAULT 0,
    visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tr_businesses_updated_at ON public.businesses;
CREATE TRIGGER tr_businesses_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- SEGURIDAD RLS (ROW LEVEL SECURITY)
-- =============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- 1. Políticas de admin_users
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow authenticated users to read admin_users" ON public.admin_users;
CREATE POLICY "Allow authenticated users to read admin_users"
    ON public.admin_users FOR SELECT
    TO authenticated
    USING (true);

-- 2. Políticas para NOTICES
DROP POLICY IF EXISTS "Public can view notices" ON public.notices;
CREATE POLICY "Public can view notices" ON public.notices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert notices" ON public.notices;
CREATE POLICY "Admins can insert notices" ON public.notices FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update notices" ON public.notices;
CREATE POLICY "Admins can update notices" ON public.notices FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete notices" ON public.notices;
CREATE POLICY "Admins can delete notices" ON public.notices FOR DELETE TO authenticated USING (public.is_admin());

-- 3. Políticas para SCHEDULES
DROP POLICY IF EXISTS "Public can view schedules" ON public.schedules;
CREATE POLICY "Public can view schedules" ON public.schedules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert schedules" ON public.schedules;
CREATE POLICY "Admins can insert schedules" ON public.schedules FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update schedules" ON public.schedules;
CREATE POLICY "Admins can update schedules" ON public.schedules FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete schedules" ON public.schedules;
CREATE POLICY "Admins can delete schedules" ON public.schedules FOR DELETE TO authenticated USING (public.is_admin());

-- 4. Políticas para CELLS
DROP POLICY IF EXISTS "Public can view cells" ON public.cells;
CREATE POLICY "Public can view cells" ON public.cells FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert cells" ON public.cells;
CREATE POLICY "Admins can insert cells" ON public.cells FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update cells" ON public.cells;
CREATE POLICY "Admins can update cells" ON public.cells FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete cells" ON public.cells;
CREATE POLICY "Admins can delete cells" ON public.cells FOR DELETE TO authenticated USING (public.is_admin());

-- 5. Políticas para EVENTS
DROP POLICY IF EXISTS "Public can view events" ON public.events;
CREATE POLICY "Public can view events" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
CREATE POLICY "Admins can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events" ON public.events FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events" ON public.events FOR DELETE TO authenticated USING (public.is_admin());

-- 6. Políticas para RESOURCES
DROP POLICY IF EXISTS "Public can view resources" ON public.resources;
CREATE POLICY "Public can view resources" ON public.resources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert resources" ON public.resources;
CREATE POLICY "Admins can insert resources" ON public.resources FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update resources" ON public.resources;
CREATE POLICY "Admins can update resources" ON public.resources FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete resources" ON public.resources;
CREATE POLICY "Admins can delete resources" ON public.resources FOR DELETE TO authenticated USING (public.is_admin());

-- 7. Políticas para BUSINESSES
DROP POLICY IF EXISTS "Public can view businesses" ON public.businesses;
CREATE POLICY "Public can view businesses" ON public.businesses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert businesses" ON public.businesses;
CREATE POLICY "Admins can insert businesses" ON public.businesses FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update businesses" ON public.businesses;
CREATE POLICY "Admins can update businesses" ON public.businesses FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete businesses" ON public.businesses;
CREATE POLICY "Admins can delete businesses" ON public.businesses FOR DELETE TO authenticated USING (public.is_admin());

-- =============================================================================
-- PUBLICACIÓN EN SUPABASE REALTIME
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notices'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notices, public.schedules, public.cells, public.events, public.resources, public.businesses;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Si ya están agregadas o la publicación no existe, continuar sin error
END $$;

-- =============================================================================
-- SEMBRADO DE DATOS REALES DEL PROYECTO (IDEMPOTENTE CON UPSERT)
-- =============================================================================

-- 1. AVISOS TEMPORALES
INSERT INTO public.notices (id, title, text, start_date, end_date, visible)
VALUES (
    'notice-1',
    'Cultos Congregacionales',
    'Les recordamos que nuestros cultos generales en sede central son los Jueves 19:30 hs y Domingos 18:30 hs. ¡Te esperamos junto a tu familia!',
    '2026-01-01',
    '2026-12-31',
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    text = EXCLUDED.text,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    visible = EXCLUDED.visible;

-- 2. HORARIOS DE CULTOS
INSERT INTO public.schedules (id, name, day, time, location, type, short_desc, full_desc, organizer, target, what_to_expect, display_order, visible)
VALUES 
(
    'sched-jueves',
    'Reunión General de Jueves',
    'Jueves',
    '19:30 hs',
    'Sede Central (Av. Wilson Ferreira Aldunate & 25 de Agosto)',
    'templo',
    'Culto congregacional en sede central: alabanza y estudio de la Palabra de Dios.',
    'Una reunión enfocada en la edificación espiritual de la congregación, la enseñanza profunda de las Sagradas Escrituras y un tiempo de oración intercesora por las familias y necesidades de Maldonado.',
    'Liderazgo pastoral y ministerios de apoyo',
    'Toda la familia, jóvenes, adultos y personas interesadas en conocer más de Dios',
    'Un ambiente acogedor y reverente, alabanzas congregacionales, predicación bíblica clara y un momento final de oración por peticiones personales.',
    1,
    true
),
(
    'sched-evangelismo-feria',
    'Evangelismo en la Feria',
    'Domingo',
    '10:00',
    'Feria de Maldonado',
    'evangelismo',
    'Evangelismo en la Feria',
    'Actividad de evangelismo y testimonio público en la feria de Maldonado, compartiendo las Buenas Nuevas y folletos bíblicos con la comunidad.',
    'Equipo de evangelismo y liderazgo de la iglesia',
    'Toda la comunidad y visitantes de la feria',
    'Evangelismo personal, entrega de folletos, oración por las necesidades y testimonio cristiano.',
    2,
    true
),
(
    'sched-domingo',
    'Gran Celebración Dominical',
    'Domingo',
    '18:30 hs',
    'Sede Central (Av. Wilson Ferreira Aldunate & 25 de Agosto)',
    'templo',
    'Gran celebración dominical de adoración, comunión fraternal y predicación.',
    'El encuentro principal de la semana donde toda la iglesia se reúne para adorar a Dios con gozo, escuchar el mensaje bíblico de salvación y compartir en comunidad fraterna.',
    'Ministerio pastoral, coro/música y comités de servicio',
    'Toda la familia, niños, amigos y visitantes de la comunidad',
    'Adoración en vivo con el ministerio de alabanza, predicación cristocéntrica, atención cálida para nuevas visitas y un tiempo especial de ministración espiritual.',
    3,
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    day = EXCLUDED.day,
    time = EXCLUDED.time,
    location = EXCLUDED.location,
    type = EXCLUDED.type,
    short_desc = EXCLUDED.short_desc,
    full_desc = EXCLUDED.full_desc,
    organizer = EXCLUDED.organizer,
    target = EXCLUDED.target,
    what_to_expect = EXCLUDED.what_to_expect,
    display_order = EXCLUDED.display_order,
    visible = EXCLUDED.visible;

-- 3. RED DE 8 CÉLULAS DE HOGAR
INSERT INTO public.cells (id, name, day, time, zone, address, description, image, phone, whatsapp_text, whatsapp_url, display_order, visible)
VALUES
(
    'cell-hipodromo',
    'Barrio Hipódromo',
    'Lunes',
    '19:00 hs',
    'Barrio Hipódromo',
    'Sector Barrio Hipódromo, Maldonado',
    'Reunión en hogar para compartir la Palabra, orar por las necesidades y fortalecer los lazos fraternos.',
    'assets/images/celula-hipodromo.jpg',
    '+598 93 836 423',
    'Hola, Dios le bendiga. Quisiera recibir información sobre la Célula Barrio Hipódromo.',
    'https://wa.me/59893836423?text=Hola,%20Dios%20le%20bendiga.%20Quisiera%20recibir%20informaci%C3%B3n%20sobre%20la%20C%C3%A9lula%20Barrio%20Hip%C3%B3dromo.',
    1,
    true
),
(
    'cell-la-milagrosa',
    'La Milagrosa',
    'Martes',
    '19:00 hs',
    'Barrio La Milagrosa',
    'Barrio La Milagrosa, Maldonado',
    'Espacio de estudio bíblico, crecimiento en la fe y oración por la familia en un ambiente cálido.',
    'assets/images/celula-la-milagrosa.jpg',
    '+598 95 712 960',
    'Hola, Dios le bendiga. Quisiera recibir información sobre la Célula La Milagrosa.',
    'https://wa.me/59895712960?text=Hola,%20Dios%20le%20bendiga.%20Quisiera%20recibir%20informaci%C3%B3n%20sobre%20la%20C%C3%A9lula%20La%20Milagrosa.',
    2,
    true
),
(
    'cell-cerro-pelado',
    'Cerro Pelado',
    'Martes',
    '19:30 hs',
    'Barrio Cerro Pelado',
    'Barrio Cerro Pelado, Maldonado',
    'Encuentro familiar para profundizar en las Escrituras y apoyarnos mutuamente en oración.',
    'assets/images/celula-cerro-pelado.jpg',
    '+598 94 181 784',
    'Hola, Dios le bendiga. Quisiera recibir información sobre la Célula Cerro Pelado.',
    'https://wa.me/59894181784?text=Hola,%20Dios%20le%20bendiga.%20Quisiera%20recibir%20informaci%C3%B3n%20sobre%20la%20C%C3%A9lula%20Cerro%20Pelado.',
    3,
    true
),
(
    'cell-cunetti',
    'Cuñetti',
    'Miércoles',
    '19:30 hs',
    'Barrio Cuñetti',
    'Barrio Cuñetti, Maldonado',
    'Reunión vecinal para compartir reflexiones bíblicas prácticas y orar por los hogares del barrio.',
    'assets/images/celula-cunetti.jpg',
    '+598 93 943 580',
    'Hola, Dios le bendiga. Quisiera recibir información sobre la Célula Cuñetti.',
    'https://wa.me/59893943580?text=Hola,%20Dios%20le%20bendiga.%20Quisiera%20recibir%20informaci%C3%B3n%20sobre%20la%20C%C3%A9lula%20Cu%C3%B1etti.',
    4,
    true
),
(
    'cell-rocha',
    'Ciudad de Rocha',
    'Miércoles',
    '19:30 hs',
    'Ciudad de Rocha',
    'Ciudad de Rocha (Punto de Extensión)',
    'Misión y grupo de extensión para la comunidad de Rocha con enseñanza bíblica y oración.',
    'assets/images/celula-rocha.jpg',
    '+598 94 867 047',
    'Hola, Dios le bendiga. Quisiera recibir información sobre la Célula Rocha.',
    'https://wa.me/59894867047?text=Hola,%20Dios%20le%20bendiga.%20Quisiera%20recibir%20informaci%C3%B3n%20sobre%20la%20C%C3%A9lula%20Rocha.',
    5,
    true
),
(
    'cell-maldonado-nuevo',
    'Maldonado Nuevo',
    'Viernes',
    '19:00 hs',
    'Maldonado Nuevo',
    'Sector Maldonado Nuevo, Maldonado',
    'Discipulado práctico en el hogar, alabanza y compañerismo en el amor de Cristo.',
    'assets/images/celula-maldonado-nuevo.jpg',
    '+598 91 884 036',
    'Hola, Dios le bendiga. Quisiera recibir información sobre la Célula Maldonado Nuevo.',
    'https://wa.me/59891884036?text=Hola,%20Dios%20le%20bendiga.%20Quisiera%20recibir%20informaci%C3%B3n%20sobre%20la%20C%C3%A9lula%20Maldonado%20Nuevo.',
    6,
    true
),
(
    'cell-centro',
    'Centro',
    'Viernes',
    '19:00 hs',
    'Maldonado Centro',
    'Maldonado Centro',
    'Reunión céntrica de estudio bíblico, alabanza y bienvenida a quienes trabajan o viven en el centro.',
    'assets/images/celula-centro.jpg',
    '+598 91 479 591',
    'Hola, Dios le bendiga. Quisiera recibir información sobre la Célula Centro.',
    'https://wa.me/59891479591?text=Hola,%20Dios%20le%20bendiga.%20Quisiera%20recibir%20informaci%C3%B3n%20sobre%20la%20C%C3%A9lula%20Centro.',
    7,
    true
),
(
    'cell-barrio-norte',
    'Barrio Norte',
    'Viernes',
    '19:30 hs',
    'Sector Barrio Norte',
    'Sector Barrio Norte, Maldonado',
    'Comunión cristiana, adoración y estudio de la Palabra para edificación de los hogares.',
    'assets/images/celula-barrio-norte.jpg',
    '+598 95 615 798',
    'Hola, Dios le bendiga. Quisiera recibir información sobre la Célula Barrio Norte.',
    'https://wa.me/59895615798?text=Hola,%20Dios%20le%20bendiga.%20Quisiera%20recibir%20informaci%C3%B3n%20sobre%20la%20C%C3%A9lula%20Barrio%20Norte.',
    8,
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    day = EXCLUDED.day,
    time = EXCLUDED.time,
    zone = EXCLUDED.zone,
    address = EXCLUDED.address,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    phone = EXCLUDED.phone,
    whatsapp_text = EXCLUDED.whatsapp_text,
    whatsapp_url = EXCLUDED.whatsapp_url,
    display_order = EXCLUDED.display_order,
    visible = EXCLUDED.visible;

-- 4. AGENDA Y PRÓXIMAS ACTIVIDADES
INSERT INTO public.events (id, title, date, time, location, category, description, public, featured)
VALUES
(
    'evt-1',
    'Culto Especial de Oración e Intercesión',
    '2026-09-10',
    '19:30 hs',
    'Sede Central (Av. Wilson Ferreira Aldunate & 25 de Agosto)',
    'Culto especial',
    'Noche consagrada al clamor por las familias, sanidad divina y dirección espiritual para nuestra comunidad.',
    true,
    true
),
(
    'evt-2',
    'Encuentro Unido de Jóvenes',
    '2026-09-19',
    '18:00 hs',
    'Sede Central IEANJESÚS Maldonado',
    'Jóvenes',
    'Reunión especial de adoración, dinámicas, palabra para la juventud y refrigerio compartido.',
    true,
    true
),
(
    'evt-3',
    'Jornada de Evangelismo y Plan Cornelio',
    '2026-09-26',
    '15:30 hs',
    'Punto de encuentro: Sede Central Maldonado',
    'Evangelismo',
    'Salida misionera para compartir el mensaje del evangelio y folletos en los barrios de Maldonado.',
    true,
    false
),
(
    'evt-4',
    'Santa Cena y Celebración Congregacional',
    '2026-10-04',
    '18:30 hs',
    'Sede Central IEANJESÚS Maldonado',
    'Culto especial',
    'Conmemoración solemne del sacrificio de nuestro Señor Jesucristo y tiempo de profunda comunión espiritual.',
    true,
    true
),
(
    'evt-5',
    'Seminario de Discipulado y Doctrina Bíblica',
    '2026-10-17',
    '16:00 hs',
    'Salón Principal Sede Central',
    'Enseñanza',
    'Taller formativo para nuevos creyentes y líderes sobre los fundamentos bíblicos y la vida práctica en Cristo.',
    true,
    false
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    date = EXCLUDED.date,
    time = EXCLUDED.time,
    location = EXCLUDED.location,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    public = EXCLUDED.public,
    featured = EXCLUDED.featured;

-- 5. MATERIAL GRATUITO
INSERT INTO public.resources (id, title, category, description, file_type, external_url, display_order, visible)
VALUES
(
    'res-1',
    'Folleto: El Camino Bíblico de la Salvación',
    'Evangelismo',
    'Material explicativo claro y directo con citas bíblicas para compartir con familiares, vecinos y amigos.',
    'PDF',
    'https://drive.google.com/drive/folders/1example-evangelismo',
    1,
    true
),
(
    'res-2',
    'Plan Cornelio — Guía Práctica de Evangelismo y Discipulado',
    'Plan Cornelio',
    'Manual de orientación para visitas en hogares, diálogo testimonial y acompañamiento de nuevas personas interesadas en el evangelio.',
    'Presentación',
    'https://drive.google.com/drive/folders/1example-plan-cornelio',
    2,
    true
),
(
    'res-3',
    'Bosquejos Bíblicos para el Estudio de la Palabra',
    'Bosquejos y Enseñanzas',
    'Compilado de investigaciones temáticas, análisis de palabras clave en el texto original y referencias cruzadas.',
    'Documento',
    'https://drive.google.com/drive/folders/1example-bosquejos',
    3,
    true
),
(
    'res-4',
    'Fundamentos de la Fe y la Unicidad de Dios',
    'Doctrina',
    'Estudio doctrinal profundo acerca de la revelación de Dios en Jesucristo, el bautismo bíblico y la promesa del Espíritu Santo.',
    'PDF',
    'https://drive.google.com/drive/folders/1example-doctrina',
    4,
    true
),
(
    'res-5',
    'Sanidad Divina y Fe Práctica en el Hogar',
    'Doctrina',
    'Enseñanza sobre las promesas del Señor para la sanidad, la oración de fe y la restauración integral de la familia.',
    'Folleto',
    'https://drive.google.com/drive/folders/1example-sanidad',
    5,
    true
),
(
    'res-6',
    'Cómo Iniciar y Desarrollar una Célula de Hogar',
    'Plan Cornelio',
    'Orientación para anfitriones y líderes celulares: dinámica de la reunión, bienvenida y cuidado pastoral.',
    'PDF',
    'https://drive.google.com/drive/folders/1example-celulas',
    6,
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    file_type = EXCLUDED.file_type,
    external_url = EXCLUDED.external_url,
    display_order = EXCLUDED.display_order,
    visible = EXCLUDED.visible;

-- 6. EMPRENDIMIENTOS DE NUESTRA COMUNIDAD
INSERT INTO public.businesses (id, name, category, description, link_type, phone, url, whatsapp_url, logo_text, logo, display_order, visible)
VALUES
(
    'biz-boomer',
    'Boomer Studio',
    'Estudio Creativo & Multimedia',
    'Servicios de diseño gráfico, identidad visual, producción audiovisual y desarrollo web profesional.',
    'Instagram',
    '+598 98 094 062',
    'https://www.instagram.com/boomerstudio.mktg?stkn=MTc2enVlbTU5cnA1cg==',
    'https://wa.me/59898094062?text=Hola,%20quisiera%20consultar%20por%20los%20servicios%20de%20Boomer%20Studio.',
    'BOOMER STUDIO',
    NULL,
    1,
    true
),
(
    'biz-control-clima',
    'Control Clima',
    'Climatización & Confort',
    'Instalación, mantenimiento y reparación de sistemas de aire acondicionado y climatización para hogares y comercios.',
    'WhatsApp',
    '+598 94 494 907',
    'https://wa.me/59894494907?text=Hola,%20quisiera%20consultar%20por%20los%20servicios%20de%20Control%20Clima.',
    NULL,
    'CONTROL CLIMA',
    NULL,
    2,
    true
),
(
    'biz-jb-construcciones',
    'JB² Construcciones',
    'Construcción & Reformas',
    'Obras civiles, albañilería tradicional, reformas integrales, yeso, pintura y terminaciones de calidad.',
    'WhatsApp',
    '+598 99 655 825',
    'https://wa.me/59899655825?text=Hola,%20quisiera%20consultar%20por%20los%20servicios%20de%20JB%C2%B2%20Construcciones.',
    NULL,
    'JB² CONSTRUCCIONES',
    NULL,
    3,
    true
),
(
    'biz-cc-construimos',
    'C&C — Construimos tu proyecto',
    'Arquitectura & Obras',
    'Planificación, dirección técnica y ejecución de proyectos constructivos, remodelaciones y diseño de espacios.',
    'WhatsApp',
    '+598 94 181 784',
    'https://wa.me/59894181784?text=Hola,%20quisiera%20consultar%20por%20los%20servicios%20de%20C%26C.',
    NULL,
    'C&C — CONSTRUIMOS TU PROYECTO',
    NULL,
    4,
    true
),
(
    'biz-kabby',
    'KABBY',
    'Modista / Confección de prendas',
    'Confección y arreglo de prendas, trabajos de modista y soluciones personalizadas en costura, con atención cuidada y trabajo a medida.',
    'WhatsApp',
    '+598 92 659 579',
    'https://wa.me/59892659579?text=Hola,%20quisiera%20consultar%20por%20los%20servicios%20de%20KABBY.',
    'https://wa.me/59892659579?text=Hola,%20quisiera%20consultar%20por%20los%20servicios%20de%20KABBY.',
    'KABBY',
    'assets/images/logo-kabby.svg',
    5,
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    link_type = EXCLUDED.link_type,
    phone = EXCLUDED.phone,
    url = EXCLUDED.url,
    whatsapp_url = EXCLUDED.whatsapp_url,
    logo_text = EXCLUDED.logo_text,
    logo = EXCLUDED.logo,
    display_order = EXCLUDED.display_order,
    visible = EXCLUDED.visible;
