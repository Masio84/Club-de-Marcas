-- ====================================================================
-- CLUB DE MARCAS - CONFIGURACIÓN DE BASE DE DATOS (ESPAÑOL DE MÉXICO)
-- ====================================================================

-- 1. TABLA DE PERFILES (Extensión de auth.users de Supabase)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    full_name TEXT,
    avatar_url TEXT,
    address TEXT,
    phone TEXT,
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    privacy_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    legal_version TEXT,
    membership_tier TEXT DEFAULT NULL CHECK (membership_tier IN (NULL, 'basic', 'premium')),
    membership_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    reward_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (reward_balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Seguridad a Nivel de Fila (RLS) en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. FUNCIÓN DE SEGURIDAD PARA VERIFICAR SI EL USUARIO ES ADMINISTRADOR
-- Se define como SECURITY DEFINER para evitar recursión infinita en las políticas RLS.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql;

-- 3. POLÍTICAS DE RLS PARA public.profiles
CREATE POLICY "Permitir lectura a usuarios autenticados" 
ON public.profiles FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserción de propio perfil" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Permitir actualización de propio perfil o por administrador" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Permitir eliminación solo a administradores" 
ON public.profiles FOR DELETE 
USING (public.is_admin());


-- 4. TABLA DE PRODUCTOS
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10, 2) CHECK (original_price >= price),
    inventory INTEGER NOT NULL DEFAULT 0 CHECK (inventory >= 0),
    category TEXT NOT NULL CHECK (category IN ('Ropa', 'Calzado')),
    image_url TEXT,
    is_prestige BOOLEAN NOT NULL DEFAULT FALSE,
    return_rate_basic NUMERIC(5, 2) NOT NULL DEFAULT 2.00 CHECK (return_rate_basic >= 0),
    return_rate_premium NUMERIC(5, 2) NOT NULL DEFAULT 10.00 CHECK (return_rate_premium >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS PARA public.products
CREATE POLICY "Permitir lectura pública de productos" 
ON public.products FOR SELECT 
USING (TRUE);

CREATE POLICY "Permitir escritura solo a administradores" 
ON public.products FOR ALL 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());


-- 5. TABLA DE CARRITOS
CREATE TABLE public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en carts
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS PARA public.carts
CREATE POLICY "Permitir acceso solo al propietario del carrito" 
ON public.carts FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);


-- 6. TABLA DE ELEMENTOS DEL CARRITO (cart_items)
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    UNIQUE(cart_id, product_id)
);

-- Habilitar RLS en cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- FUNCIÓN AUXILIAR PARA RLS DE ELEMENTOS DEL CARRITO
CREATE OR REPLACE FUNCTION public.is_cart_owner(cart_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.carts
        WHERE id = cart_uuid AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLÍTICAS RLS PARA public.cart_items
CREATE POLICY "Permitir acceso a elementos del carrito propio" 
ON public.cart_items FOR ALL 
USING (public.is_cart_owner(cart_id)) 
WITH CHECK (public.is_cart_owner(cart_id));


-- 7. TABLA DE PEDIDOS (orders)
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'completed', 'pending_payment', 'paid', 'processing', 'delivered', 'cancelled', 'refunded')),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS PARA public.orders
CREATE POLICY "Clientes pueden ver sus propios pedidos o administradores todos" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Clientes pueden crear sus propios pedidos" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Solo administradores pueden modificar pedidos" 
ON public.orders FOR UPDATE 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

CREATE POLICY "Solo administradores pueden eliminar pedidos" 
ON public.orders FOR DELETE 
USING (public.is_admin());


-- 8. TABLA DE ELEMENTOS DEL PEDIDO (order_items)
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders ON DELETE CASCADE,
    product_id UUID REFERENCES public.products ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0)
);

-- Habilitar RLS en order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- FUNCIÓN AUXILIAR PARA RLS DE ELEMENTOS DE PEDIDO
CREATE OR REPLACE FUNCTION public.is_order_owner(order_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.orders
        WHERE id = order_uuid AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLÍTICAS RLS PARA public.order_items
CREATE POLICY "Clientes pueden ver elementos de sus propios pedidos o admins todos" 
ON public.order_items FOR SELECT 
USING (public.is_order_owner(order_id) OR public.is_admin());

CREATE POLICY "Clientes pueden insertar elementos en sus propios pedidos" 
ON public.order_items FOR INSERT 
WITH CHECK (public.is_order_owner(order_id));

CREATE POLICY "Solo administradores pueden modificar elementos de pedidos" 
ON public.order_items FOR ALL 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());


-- ==========================================
-- TRIGGER DE REGISTRO AUTOMÁTICO EN PROFILES
-- ==========================================

-- Función que se ejecuta al registrarse un usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, email, role, is_banned, full_name, avatar_url, phone,
        terms_accepted, privacy_accepted, accepted_at, legal_version
    )
    VALUES (
        NEW.id,
        NEW.email,
        -- El primer usuario registrado será administrador automáticamente
        CASE 
            WHEN NOT EXISTS (SELECT 1 FROM public.profiles) THEN 'admin'
            ELSE 'client'
        END,
        FALSE,
        coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url',
        coalesce(NEW.phone, NEW.raw_user_meta_data->>'phone'),
        coalesce((NEW.raw_user_meta_data->>'terms_accepted')::boolean, false),
        coalesce((NEW.raw_user_meta_data->>'privacy_accepted')::boolean, false),
        (NEW.raw_user_meta_data->>'accepted_at')::timestamp with time zone,
        NEW.raw_user_meta_data->>'legal_version'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sobre auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- PRODUCTOS SEMILLA (MÉXICO)
-- ==========================================

INSERT INTO public.products (title, description, price, original_price, inventory, category, image_url)
VALUES
-- Categoría: Calzado
('Nike Air Max 90 White', 'Los icónicos tenis de correr con amortiguación Air Max visible, de alta comodidad para el uso diario.', 2499.00, 3199.00, 25, 'Calzado', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop'),
('Adidas Ultraboost Light', 'Tenis de running de alto rendimiento con retorno de energía Boost y comodidad Primeknit.', 3499.00, 4299.00, 18, 'Calzado', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop'),
('Puma Slipstream Classic', 'Tenis retro de básquetbol de piel con un diseño limpio y moderno para el estilo de vida urbano.', 1899.00, 2200.00, 15, 'Calzado', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop'),
('Air Jordan 1 Retro High OG', 'La silueta legendaria en piel premium, colores clásicos y un ajuste óptimo para coleccionistas.', 4399.00, 5299.00, 10, 'Calzado', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&auto=format&fit=crop'),
('New Balance 550 White Green', 'Calzado casual retro inspirado en el básquetbol de los 80 con acabados de piel y gamuza.', 2899.00, 3299.00, 20, 'Calzado', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop'),

-- Categoría: Ropa
('Sudadera Essentials Hoodie Moss', 'Sudadera de cuello redondo con capucha, confección de felpa pesada y logo Essentials engomado.', 1999.00, 2699.00, 15, 'Ropa', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop'),
('Chamarra The North Face Nuptse 1996', 'La chamarra de plumón icónica con corte cuadrado, tejido ripstop brillante y gorro empacable.', 6499.00, 8199.00, 8, 'Ropa', 'https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=600&auto=format&fit=crop'),
('Jeans Levi''s 501 Original Fit', 'Los pantalones de mezclilla clásicos con corte recto y bragueta de botones originales de Levi''s.', 1499.00, 1999.00, 35, 'Ropa', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop'),
('Playera Balenciaga Oversized Black', 'Playera de corte holgado de algodón orgánico con bordado Balenciaga minimalista en el pecho.', 4100.00, 5500.00, 12, 'Ropa', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop'),
('Chamarra Plumón Moncler Maya Black', 'Chamarra de nailon laqué brillante acolchada con plumón, silueta clásica Moncler y parche en manga.', 18999.00, 24500.00, 3, 'Ropa', 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop');

-- ==========================================
-- TABLA DE AJUSTES GENERALES DE LA TIENDA
-- ==========================================
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir lectura pública de ajustes" ON public.store_settings FOR SELECT USING (TRUE);
CREATE POLICY "Permitir escritura de ajustes solo a administradores" ON public.store_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- ==========================================
-- TABLA DE BITÁCORA DE SEGURIDAD (AUDITORÍA)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    action TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS estricto
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- El usuario final solo puede leer sus propios logs de seguridad.
CREATE POLICY "Permitir lectura de logs propios" ON public.security_logs 
    FOR SELECT USING (auth.uid() = user_id);

-- Permitir la inserción para el usuario actual o sistema durante el registro (si el usuario aún no está logueado, auth.uid() es null)
CREATE POLICY "Permitir inserción al propietario o sistema" ON public.security_logs 
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- ==========================================================================================
-- TRIGGER DE AUDITORÍA AUTOMÁTICA DE TÉRMINOS Y CONDICIONES
-- ==========================================================================================
CREATE OR REPLACE FUNCTION public.log_profile_terms_acceptance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.terms_accepted = TRUE AND NEW.privacy_accepted = TRUE AND (OLD IS NULL OR OLD.terms_accepted = FALSE OR OLD.privacy_accepted = FALSE) THEN
        INSERT INTO public.security_logs (user_id, action, ip_address)
        VALUES (NEW.id, 'accepted_terms_and_privacy', '0.0.0.0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_terms_accepted_audit
    AFTER INSERT OR UPDATE OF terms_accepted, privacy_accepted ON public.profiles
    FOR EACH ROW
    WHEN (NEW.terms_accepted = TRUE AND NEW.privacy_accepted = TRUE)
    EXECUTE FUNCTION public.log_profile_terms_acceptance();

-- ==========================================================================================
-- TABLA DE CALIFICACIONES Y OPINIONES (product_reviews)
-- ==========================================================================================
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir lectura pública de calificaciones" ON public.product_reviews 
    FOR SELECT USING (TRUE);

CREATE POLICY "Permitir inserción de opiniones a usuarios autenticados" ON public.product_reviews 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir edición/eliminación propia de opiniones" ON public.product_reviews 
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trigger de auditoría para opiniones
CREATE OR REPLACE FUNCTION public.log_profile_review_submission()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.security_logs (user_id, action, ip_address)
    VALUES (NEW.user_id, 'submitted_product_review', '0.0.0.0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_product_review_submitted_audit
    AFTER INSERT ON public.product_reviews
    FOR EACH ROW EXECUTE FUNCTION public.log_profile_review_submission();


-- ==========================================================================================
-- TABLA DE INVERSIONES A PLAZO (term_investments)
-- ==========================================================================================
CREATE TABLE IF NOT EXISTS public.term_investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    term_months INT NOT NULL CHECK (term_months IN (1, 3, 6, 12)),
    annual_rate NUMERIC(5, 2) NOT NULL CHECK (annual_rate > 0),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expected_yield NUMERIC(10, 2) NOT NULL CHECK (expected_yield >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.term_investments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir lectura de inversiones propias" ON public.term_investments 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Permitir inserción de inversiones propias" ON public.term_investments 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir actualización de inversiones propias (por ejemplo, al completar)" ON public.term_investments 
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ==========================================================================================
-- TABLA DE HISTORIAL DE TRANSACCIONES DE ACTIVOS (reward_transactions)
-- ==========================================================================================
CREATE TABLE IF NOT EXISTS public.reward_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'purchase_reward', 'investment_locked', 'investment_returned', 'admin_adjustment',
        'reward_earned', 'reward_reserved', 'reward_released', 'reward_used', 'reward_reversed', 'reward_expired', 'reward_cancelled'
    )),
    reference_id UUID,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('pending', 'available', 'reserved', 'released', 'used', 'reversed', 'expired', 'cancelled')),
    order_id UUID,
    order_item_id UUID,
    reservation_id UUID,
    refund_id UUID,
    payment_id UUID,
    idempotency_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir lectura de transacciones de activos propias" ON public.reward_transactions 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Permitir inserción de transacciones de activos propias" ON public.reward_transactions 
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ==========================================================================================
-- TABLA DE RESERVAS DE SALDO DE RECOMPENSA (reward_reservations) - REEMPLAZO SEGURO DE term_investments
-- ==========================================================================================
CREATE TABLE IF NOT EXISTS public.reward_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    term_months INT NOT NULL CHECK (term_months IN (1, 3, 6, 12)),
    bonus_rate NUMERIC(5, 2) NOT NULL CHECK (bonus_rate > 0),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    release_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expected_bonus NUMERIC(10, 2) NOT NULL CHECK (expected_bonus >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released', 'cancelled', 'expired')),
    membership_tier_at_creation TEXT CHECK (membership_tier_at_creation IN ('basic', 'premium')),
    calculation_formula_version TEXT DEFAULT 'v1',
    idempotency_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en reward_reservations
ALTER TABLE public.reward_reservations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para reward_reservations
CREATE POLICY "Permitir lectura de reservas propias" ON public.reward_reservations 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Permitir inserción de reservas propias" ON public.reward_reservations 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir actualización de reservas propias" ON public.reward_reservations 
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ==========================================================================================
-- TABLA DE REGLAS DE CONFIGURACIÓN DE BONIFICACIÓN (reward_bonus_rules)
-- ==========================================================================================
CREATE TABLE IF NOT EXISTS public.reward_bonus_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_tier TEXT NOT NULL CHECK (membership_tier IN ('basic', 'premium')),
    term_months INT NOT NULL CHECK (term_months IN (1, 3, 6, 12)),
    bonus_rate NUMERIC(5, 2) NOT NULL CHECK (bonus_rate >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(membership_tier, term_months)
);

-- Habilitar RLS en reward_bonus_rules
ALTER TABLE public.reward_bonus_rules ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para reward_bonus_rules
CREATE POLICY "Permitir lectura pública de reglas de bonificación" ON public.reward_bonus_rules
    FOR SELECT USING (TRUE);

CREATE POLICY "Permitir gestión de reglas solo a administradores" ON public.reward_bonus_rules
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    );

-- Insertar reglas por defecto
INSERT INTO public.reward_bonus_rules (membership_tier, term_months, bonus_rate)
VALUES
    ('basic', 1, 5.00),
    ('basic', 3, 8.00),
    ('basic', 6, 12.00),
    ('basic', 12, 15.00),
    ('premium', 1, 7.00),
    ('premium', 3, 10.00),
    ('premium', 6, 14.00),
    ('premium', 12, 17.00)
ON CONFLICT (membership_tier, term_months) DO UPDATE SET bonus_rate = EXCLUDED.bonus_rate;
-- ==========================================================================================
-- ÍNDICES ÚNICOS DE IDEMPOTENCIA A NIVEL DE BASE DE DATOS
-- ==========================================================================================
CREATE UNIQUE INDEX IF NOT EXISTS reward_transactions_order_earned_unique 
    ON public.reward_transactions (order_id, type) 
    WHERE order_id IS NOT NULL AND type = 'reward_earned';

CREATE UNIQUE INDEX IF NOT EXISTS reward_transactions_reservation_released_unique 
    ON public.reward_transactions (reservation_id, type) 
    WHERE reservation_id IS NOT NULL AND type = 'reward_released';

CREATE UNIQUE INDEX IF NOT EXISTS reward_transactions_order_reversed_unique 
    ON public.reward_transactions (order_id, type) 
    WHERE order_id IS NOT NULL AND type = 'reward_reversed';

CREATE UNIQUE INDEX IF NOT EXISTS reward_transactions_idempotency_key_unique 
    ON public.reward_transactions (idempotency_key) 
    WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS reward_reservations_idempotency_key_unique 
    ON public.reward_reservations (idempotency_key) 
    WHERE idempotency_key IS NOT NULL;


-- ==========================================================================================
-- FUNCIONES RPC ATÓMICAS DE BASE DE DATOS
-- ==========================================================================================

-- 1. Crear reserva de saldo de forma atómica
CREATE OR REPLACE FUNCTION public.create_reward_reservation_atomic(
    p_user_id UUID,
    p_amount NUMERIC,
    p_term_months INT,
    p_bonus_rate NUMERIC,
    p_release_date TIMESTAMP WITH TIME ZONE,
    p_expected_bonus NUMERIC,
    p_membership_tier TEXT,
    p_idempotency_key TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_reservation_id UUID;
BEGIN
    -- Descontar el saldo del perfil (el CHECK >= 0 en profiles evitará saldo negativo)
    UPDATE public.profiles
    SET reward_balance = reward_balance - p_amount
    WHERE id = p_user_id;

    -- Insertar la reserva
    INSERT INTO public.reward_reservations (
        user_id, amount, term_months, bonus_rate, release_date, expected_bonus, status, membership_tier_at_creation, idempotency_key
    )
    VALUES (
        p_user_id, p_amount, p_term_months, p_bonus_rate, p_release_date, p_expected_bonus, 'active', p_membership_tier, p_idempotency_key
    )
    RETURNING id INTO v_reservation_id;

    -- Registrar la transacción
    INSERT INTO public.reward_transactions (
        user_id, amount, type, reference_id, description, status, reservation_id, idempotency_key
    )
    VALUES (
        p_user_id, -p_amount, 'reward_reserved', v_reservation_id, 
        'Saldo Club reservado por periodo de permanencia a ' || p_term_months || ' mes(es) al ' || p_bonus_rate || '%', 
        'reserved', v_reservation_id, p_idempotency_key
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Liberar reserva de saldo de forma atómica
CREATE OR REPLACE FUNCTION public.release_reward_reservation_atomic(
    p_user_id UUID,
    p_reservation_id UUID
) RETURNS VOID AS $$
DECLARE
    v_amount NUMERIC;
    v_expected_bonus NUMERIC;
    v_status TEXT;
    v_total_return NUMERIC;
BEGIN
    -- Obtener los detalles de la reserva y bloquear la fila para evitar race conditions
    SELECT amount, expected_bonus, status 
    INTO v_amount, v_expected_bonus, v_status
    FROM public.reward_reservations
    WHERE id = p_reservation_id AND user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reserva no encontrada';
    END IF;

    IF v_status = 'released' THEN
        RAISE EXCEPTION 'La reserva ya fue liberada anteriormente';
    END IF;

    v_total_return := v_amount + v_expected_bonus;

    -- Actualizar estado de la reserva
    UPDATE public.reward_reservations
    SET status = 'released', updated_at = now()
    WHERE id = p_reservation_id;

    -- Acreditar el saldo al perfil
    UPDATE public.profiles
    SET reward_balance = reward_balance + v_total_return
    WHERE id = p_user_id;

    -- Registrar la transacción
    INSERT INTO public.reward_transactions (
        user_id, amount, type, reference_id, description, status, reservation_id
    )
    VALUES (
        p_user_id, v_total_return, 'reward_released', p_reservation_id, 
        'Liberación de permanencia de saldo acreditado (+' || v_expected_bonus || ' bonificación)', 
        'released', p_reservation_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Acreditar recompensa de pedido de forma atómica
CREATE OR REPLACE FUNCTION public.credit_order_reward_atomic(
    p_user_id UUID,
    p_order_id UUID,
    p_amount NUMERIC
) RETURNS VOID AS $$
BEGIN
    -- Verificar si ya se acreditó la recompensa para evitar duplicados
    IF EXISTS (
        SELECT 1 FROM public.reward_transactions 
        WHERE order_id = p_order_id AND type = 'reward_earned'
    ) THEN
        RETURN; -- Ya acreditado
    END IF;

    -- Acreditar balance
    UPDATE public.profiles
    SET reward_balance = reward_balance + p_amount
    WHERE id = p_user_id;

    -- Registrar transacción
    INSERT INTO public.reward_transactions (
        user_id, amount, type, order_id, description, status
    )
    VALUES (
        p_user_id, p_amount, 'reward_earned', p_order_id, 
        'Recompensa de Saldo Club acreditada por compra #' || p_order_id, 
        'available'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Revertir recompensa de pedido de forma atómica
CREATE OR REPLACE FUNCTION public.reverse_order_reward_atomic(
    p_user_id UUID,
    p_order_id UUID,
    p_amount NUMERIC
) RETURNS VOID AS $$
BEGIN
    -- Verificar si ya se reversó para evitar doble reversa
    IF EXISTS (
        SELECT 1 FROM public.reward_transactions 
        WHERE order_id = p_order_id AND type = 'reward_reversed'
    ) THEN
        RETURN; -- Ya reversado
    END IF;

    -- Deducir balance (el check >= 0 en profiles evitará saldo negativo)
    UPDATE public.profiles
    SET reward_balance = reward_balance - p_amount
    WHERE id = p_user_id;

    -- Registrar transacción
    INSERT INTO public.reward_transactions (
        user_id, amount, type, order_id, description, status
    )
    VALUES (
        p_user_id, -p_amount, 'reward_reversed', p_order_id, 
        'Reversión de recompensa de Saldo Club por cancelación/devolución de compra #' || p_order_id, 
        'reversed'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
