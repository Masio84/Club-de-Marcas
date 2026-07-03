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
    category TEXT NOT NULL CHECK (category IN ('Tenis', 'Relojes', 'Gorras', 'Lentes', 'Bolsas', 'Cuidado Personal')),
    image_url TEXT,
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
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'completed')),
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
-- Categoría: Tenis
('Nike Air Max 90 White', 'Los icónicos tenis de correr con amortiguación Air Max visible, ideales para el uso diario.', 2499.00, 3199.00, 25, 'Tenis', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop'),
('Adidas Ultraboost Light', 'Tenis de running de alto rendimiento con retorno de energía Boost y comodidad Primeknit.', 3499.00, 4299.00, 18, 'Tenis', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop'),
('Puma Slipstream Classic', 'Tenis retro de básquetbol de piel con un diseño limpio y moderno para el estilo de vida urbano.', 1899.00, 1899.00, 15, 'Tenis', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop'),

-- Categoría: Relojes
('Seiko 5 Sports Automatic', 'Reloj automático japonés con caja de acero inoxidable, carátula negra y resistencia al agua de 100m.', 5800.00, 7200.00, 8, 'Relojes', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop'),
('Casio G-Shock GA-2100', 'El famoso "CasiOak" con estructura de carbono octagonal, ultra resistente y ligero.', 2199.00, 2699.00, 30, 'Relojes', 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&auto=format&fit=crop'),

-- Categoría: Gorras
('New Era 59FIFTY NY Yankees', 'Gorra cerrada clásica estructurada con el logotipo bordado de los Yankees de Nueva York.', 799.00, 999.00, 40, 'Gorras', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop'),
('Gorra Goorin Bros The Panther', 'Gorra tipo trucker con parche de pantera en el panel frontal y malla transpirable trasera.', 899.00, 899.00, 20, 'Gorras', 'https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?w=600&auto=format&fit=crop'),

-- Categoría: Lentes
('Ray-Ban Wayfarer Classic', 'Lentes de sol icónicos con armazón de acetato negro brillante y micas verdes clásicas G-15.', 2999.00, 3799.00, 12, 'Lentes', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop'),
('Oakley Frogskins Black', 'Lentes deportivos de estilo de vida con armazón ligero O Matter y micas Prizm Grey.', 2299.00, 2899.00, 10, 'Lentes', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop'),

-- Categoría: Bolsas
('Coach Charter Crossbody', 'Bolsa cruzada de piel granulada con compartimentos con cierre y correa ajustable para hombro.', 5600.00, 6800.00, 6, 'Bolsas', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop'),
('Longchamp Le Pliage Original', 'Bolsa de hombro de nylon plegable con detalles en piel marrón, un clásico francés ultra práctico.', 2400.00, 2400.00, 14, 'Bolsas', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop'),

-- Categoría: Cuidado Personal
('Minoxidil Kirkland 5% (Paquete de 3)', 'Tratamiento de crecimiento de cabello y barba para hombres, suministro para 3 meses.', 699.00, 999.00, 50, 'Cuidado Personal', 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop'),
('Cera Cabello Suavecito Pomade Firme Hold', 'Pomada para cabello a base de agua con fijación firme y brillo medio, aroma clásico de barbería.', 349.00, 420.00, 35, 'Cuidado Personal', 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop');

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



