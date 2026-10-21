-- ====================================================================
-- HomeVet - Esquema de Base de Datos para PostgreSQL y PostgREST
-- Diseñado con soporte estricto de tipos, restricciones, claves foráneas,
-- timestamptz con zona horaria, triggers automáticos y endpoints REST.
-- Versión: 1.2.0 • Timestamp de diseño: 2026-10-21T22:35:00Z
-- ====================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA: SERVICIOS CLÍNICOS (Catálogo y Precios)
CREATE TABLE IF NOT EXISTS public.services (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(80) NOT NULL DEFAULT 'Consulta',
    pet_type VARCHAR(30) NOT NULL DEFAULT 'Ambos' CHECK (pet_type IN ('Perro', 'Gato', 'Ambos')),
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    duration VARCHAR(60) DEFAULT '40 min',
    description TEXT NOT NULL,
    icon_type VARCHAR(50) DEFAULT 'stethoscope',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices B-Tree optimizados para PostgREST
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_pet_type ON public.services(pet_type);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(active);
CREATE INDEX IF NOT EXISTS idx_services_price ON public.services(price);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON public.services(created_at DESC);

-- 3. TABLA: RESERVAS DE CLIENTES
CREATE TABLE IF NOT EXISTS public.reservations (
    id VARCHAR(40) PRIMARY KEY, -- Ej: 'HV-8921'
    client_name VARCHAR(150) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    location TEXT NOT NULL,
    pet_type VARCHAR(30) NOT NULL DEFAULT 'Perro' CHECK (pet_type IN ('Perro', 'Gato', 'Ambos')),
    pet_name VARCHAR(150) DEFAULT 'No indicado',
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    service_ids INTEGER[] NOT NULL DEFAULT '{}',
    service_names TEXT NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    notes TEXT DEFAULT 'Ninguna',
    status VARCHAR(40) NOT NULL DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'Confirmada', 'En Camino', 'Completada', 'Cancelada')),
    source VARCHAR(50) DEFAULT 'web_pwa',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices B-Tree para consultas de reservas y filtrado cronológico
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_appointment_date ON public.reservations(appointment_date);
CREATE INDEX IF NOT EXISTS idx_reservations_client_phone ON public.reservations(client_phone);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON public.reservations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_updated_at ON public.reservations(updated_at DESC);

-- 4. TABLA: USUARIOS ADMINISTRATIVOS
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(200) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(150) DEFAULT 'Administrador HomeVet',
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'veterinario', 'operador')),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABLA: CONFIGURACIÓN GENERAL DEL SISTEMA
CREATE TABLE IF NOT EXISTS public.system_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABLA: AUDITORÍA Y REGISTRO DE TIMESTAMPS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    action VARCHAR(40) NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 7. TRIGGER AUTOMÁTICO PARA ACTUALIZACIÓN DE TIMESTAMPS (updated_at)
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_services_updated_at ON public.services;
CREATE TRIGGER trg_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_reservations_updated_at ON public.reservations;
CREATE TRIGGER trg_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER trg_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 8. VISTA DE ESTADÍSTICAS PARA POSTGREST (GET /api_stats)
CREATE OR REPLACE VIEW public.api_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.reservations) AS total_reservations,
    (SELECT COUNT(*) FROM public.reservations WHERE status = 'Pendiente') AS pending_reservations,
    (SELECT COUNT(*) FROM public.reservations WHERE status IN ('Confirmada', 'En Camino')) AS in_progress_reservations,
    (SELECT COUNT(*) FROM public.reservations WHERE status = 'Completada') AS completed_reservations,
    (SELECT COALESCE(SUM(total_price), 0) FROM public.reservations WHERE status != 'Cancelada') AS total_revenue,
    (SELECT COUNT(*) FROM public.services WHERE active = true) AS active_services,
    (SELECT COUNT(*) FROM public.services) AS total_services,
    NOW() AS server_timestamp,
    (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT AS server_timestamp_epoch_ms;

-- 9. FUNCIÓN RPC DE DIAGNÓSTICO Y PRUEBAS CON TIMESTAMP (POST /rpc/test_timestamps)
CREATE OR REPLACE FUNCTION public.test_timestamps(test_label TEXT DEFAULT 'manual_test')
RETURNS JSONB AS $$
DECLARE
    v_now TIMESTAMPTZ := NOW();
    v_result JSONB;
BEGIN
    v_result := jsonb_build_object(
        'status', 'success',
        'test_label', test_label,
        'server_timestamp_iso', v_now,
        'server_epoch_ms', (EXTRACT(EPOCH FROM v_now) * 1000)::BIGINT,
        'timezone_configured', current_setting('TIMEZONE'),
        'postgres_version', version(),
        'sample_created_at_test', v_now,
        'interval_past_24h', v_now - INTERVAL '24 hours',
        'interval_future_7d', v_now + INTERVAL '7 days'
    );

    INSERT INTO public.audit_logs(entity_type, entity_id, action, payload)
    VALUES ('timestamp_test', test_label, 'DIAGNOSTIC_RUN', v_result);

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 10. CONFIGURACIÓN DE ROLES Y PERMISOS PARA POSTGREST
-- Rol anónimo (clientes públicos)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_role') THEN
        CREATE ROLE admin_role NOLOGIN;
    END IF;
END $$;

GRANT USAGE ON SCHEMA public TO anon, admin_role;
GRANT SELECT ON public.services TO anon;
GRANT INSERT ON public.reservations TO anon;
GRANT SELECT ON public.api_stats TO anon, admin_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO admin_role;
GRANT EXECUTE ON FUNCTION public.test_timestamps(TEXT) TO anon, admin_role;

-- 11. DATOS INICIALES (SEED DATA)
INSERT INTO public.services (id, title, category, pet_type, price, duration, description, icon_type, active)
VALUES 
(1, 'Consulta Médica General a Domicilio', 'Consulta', 'Ambos', 120.00, '45 - 60 min', 'Evaluación física completa: auscultación, temperatura, ojos, oídos, piel y mucosas en la comodidad y tranquilidad de tu hogar.', 'stethoscope', true),
(2, 'Vacunación y Desparasitación Integral', 'Preventivo', 'Ambos', 90.00, '30 min', 'Aplicación de vacunas (Séxtuple/Óctuple para canes, Triple Felina para gatos, o Antirrábica) más desparasitación interna con carnet oficial.', 'syringe', true),
(3, 'Control Pediátrico Cachorros y Gatitos', 'Preventivo', 'Ambos', 100.00, '40 min', 'Primera revisión veterinaria para nuevos miembros del hogar: plan nutricional, pautas de crianza, higiene y cronograma de vacunas.', 'paw', true),
(4, 'Curación de Heridas y Tratamiento', 'Tratamiento', 'Ambos', 110.00, '45 min', 'Limpieza aséptica de heridas, cambio de vendajes, retiro de puntos, administración de inyectables y analgésicos indicados.', 'bandage', true),
(5, 'Toma de Muestras y Laboratorio Clínico', 'Diagnóstico', 'Ambos', 150.00, '35 min', 'Extracción de sangre, raspados cutáneos o muestras biológicas a domicilio, sin el estrés de traslados a clínicas.', 'microscope', true),
(6, 'Certificado Zoosanitario de Salud y Viaje', 'Documentos', 'Ambos', 130.00, '30 min', 'Emisión oficial de certificado veterinario de salud para viajes nacionales, aerolíneas o trámites de bienestar animal.', 'file', true),
(7, 'Baño Medicado y Cuidado Dermatológico', 'Dermatología', 'Perro', 140.00, '60 min', 'Tratamiento dérmico con champú medicado especial para problemas de hongos, alergias, dermatitis o control antiparasitario.', 'sparkles', true),
(8, 'Atención Geriátrica y Cuidados Paliativos', 'Especialidad', 'Ambos', 135.00, '50 min', 'Atención compasiva para pacientes de la tercera edad: control del dolor crónico articular, movilidad y calidad de vida.', 'heart', true)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, title = EXCLUDED.title;

SELECT setval('public.services_id_seq', (SELECT MAX(id) FROM public.services));

INSERT INTO public.admin_users (email, password_hash, full_name, role)
VALUES ('admin@homevet.com', crypt('admin123', gen_salt('bf')), 'Administrador HomeVet', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.system_config (key, value, description)
VALUES 
('whatsapp_contact', '{"phone": "63184686", "country_code": "591"}'::jsonb, 'Número oficial de contacto de WhatsApp'),
('business_hours', '{"days": "Lunes a Sabado", "open": "10:00", "close": "18:00"}'::jsonb, 'Horarios clínicos de atención a domicilio')
ON CONFLICT (key) DO NOTHING;
