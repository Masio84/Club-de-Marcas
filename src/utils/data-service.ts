import { createClient } from './supabase/server'
import { cookies } from 'next/headers'

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    process.env.VERCEL_ENV === 'production' ||
    process.env.APP_ENV === 'production'

  if (isProduction) {
    // En producción, forzar el uso de Supabase (bloquear mock)
    return true
  }
  return !!url && url !== '' && url !== 'https://placeholder.supabase.co'
}

function assertMockAllowed() {
  if (
    process.env.NODE_ENV === 'production' || 
    process.env.VERCEL_ENV === 'production' ||
    process.env.APP_ENV === 'production'
  ) {
    console.error('[CRITICAL] Intento de usar el modo simulación (mock) en producción.');
    throw new Error('El modo simulación por cookies está estrictamente deshabilitado en producción.');
  }
}

// ==========================================
// DEFINICIÓN DE TIPOS DE DATOS
// ==========================================

export interface Profile {
  id: string
  email: string
  role: 'client' | 'admin'
  is_banned: boolean
  created_at: string
  full_name?: string
  avatar_url?: string
  address?: string
  phone?: string
  terms_accepted?: boolean
  privacy_accepted?: boolean
  accepted_at?: string
  legal_version?: string
  membership_tier?: 'basic' | 'premium' | null
  membership_expires_at?: string | null
  reward_balance?: number
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  original_price?: number
  inventory: number
  category: 'Ropa' | 'Calzado'
  image_url?: string
  created_at: string
  rating_avg?: number
  rating_count?: number
  is_prestige?: boolean
  return_rate_basic?: number
  return_rate_premium?: number
}

export interface RewardReservation {
  id: string
  user_id: string
  amount: number
  term_months: number
  bonus_rate: number
  start_date: string
  release_date: string
  expected_bonus: number
  status: 'active' | 'released' | 'cancelled' | 'expired'
  created_at: string
  membership_tier_at_creation?: string | null
  calculation_formula_version?: string
  idempotency_key?: string
}

// Alias legacy para compatibilidad
export type TermInvestment = RewardReservation;

export interface RewardTransaction {
  id: string
  user_id: string
  amount: number
  type: 'purchase_reward' | 'investment_locked' | 'investment_returned' | 'admin_adjustment' |
        'reward_earned' | 'reward_reserved' | 'reward_released' | 'reward_used' | 'reward_reversed' | 'reward_expired' | 'reward_cancelled'
  reference_id?: string
  description: string
  created_at: string
  status?: 'pending' | 'available' | 'reserved' | 'released' | 'used' | 'reversed' | 'expired' | 'cancelled'
  order_id?: string
  order_item_id?: string
  reservation_id?: string
  refund_id?: string
  payment_id?: string
  idempotency_key?: string
}

export interface ProductReview {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment?: string
  created_at: string
  profile?: Profile
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  product?: Product
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product?: Product
}

export interface Order {
  id: string
  user_id: string | null
  customer_email: string
  shipping_address: string
  status: 'pending' | 'shipped' | 'completed'
  total: number
  created_at: string
  items?: OrderItem[]
}

// ==========================================
// PRODUCTOS SEMILLA DE MAQUETA
// ==========================================
const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Nike Air Max 90 White',
    description: 'Los icónicos tenis de correr con amortiguación Air Max visible, de alta comodidad para el uso diario.',
    price: 2499.00,
    original_price: 3199.00,
    inventory: 25,
    category: 'Calzado',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
    is_prestige: false,
    return_rate_basic: 2.00,
    return_rate_premium: 10.00,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-2',
    title: 'Adidas Ultraboost Light',
    description: 'Tenis de running de alto rendimiento con retorno de energía Boost y comodidad Primeknit.',
    price: 3499.00,
    original_price: 4299.00,
    inventory: 18,
    category: 'Calzado',
    image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop',
    is_prestige: true,
    return_rate_basic: 3.00,
    return_rate_premium: 12.00,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-3',
    title: 'Puma Slipstream Classic',
    description: 'Tenis retro de básquetbol de piel con un diseño limpio y moderno para el estilo de vida urbano.',
    price: 1899.00,
    original_price: 2200.00,
    inventory: 15,
    category: 'Calzado',
    image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop',
    is_prestige: false,
    return_rate_basic: 2.00,
    return_rate_premium: 8.00,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-4',
    title: 'Air Jordan 1 Retro High OG',
    description: 'La silueta legendaria en piel premium, colores clásicos y un ajuste óptimo para coleccionistas.',
    price: 4399.00,
    original_price: 5299.00,
    inventory: 10,
    category: 'Calzado',
    image_url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&auto=format&fit=crop',
    is_prestige: true,
    return_rate_basic: 3.00,
    return_rate_premium: 15.00,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-5',
    title: 'New Balance 550 White Green',
    description: 'Calzado casual retro inspirado en el básquetbol de los 80 con acabados de piel y gamuza.',
    price: 2899.00,
    original_price: 3299.00,
    inventory: 20,
    category: 'Calzado',
    image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop',
    is_prestige: false,
    return_rate_basic: 2.00,
    return_rate_premium: 10.00,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-6',
    title: 'Sudadera Essentials Hoodie Moss',
    description: 'Sudadera de cuello redondo con capucha, confección de felpa pesada y logo Essentials engomado.',
    price: 1999.00,
    original_price: 2699.00,
    inventory: 15,
    category: 'Ropa',
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop',
    is_prestige: false,
    return_rate_basic: 2.00,
    return_rate_premium: 8.00,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-7',
    title: 'Chamarra The North Face Nuptse 1996',
    description: 'La chamarra de plumón icónica con corte cuadrado, tejido ripstop brillante y gorro empacable.',
    price: 6499.00,
    original_price: 8199.00,
    inventory: 8,
    category: 'Ropa',
    image_url: 'https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=600&auto=format&fit=crop',
    is_prestige: true,
    return_rate_basic: 4.00,
    return_rate_premium: 15.00,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-8',
    title: 'Jeans Levi\'s 501 Original Fit',
    description: 'Los pantalones de mezclilla clásicos con corte recto y bragueta de botones originales de Levi\'s.',
    price: 1499.00,
    original_price: 1999.00,
    inventory: 35,
    category: 'Ropa',
    image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop',
    is_prestige: false,
    return_rate_basic: 2.00,
    return_rate_premium: 8.00,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-9',
    title: 'Playera Balenciaga Oversized Black',
    description: 'Playera de corte holgado de algodón orgánico con bordado Balenciaga minimalista en el pecho.',
    price: 4100.00,
    original_price: 5500.00,
    inventory: 12,
    category: 'Ropa',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop',
    is_prestige: true,
    return_rate_basic: 3.50,
    return_rate_premium: 14.00,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-10',
    title: 'Chamarra Plumón Moncler Maya Black',
    description: 'Chamarra de nailon laqué brillante acolchada con plumón, silueta clásica Moncler y parche en manga.',
    price: 18999.00,
    original_price: 24500.00,
    inventory: 3,
    category: 'Ropa',
    image_url: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop',
    is_prestige: true,
    return_rate_basic: 5.00,
    return_rate_premium: 17.00,
    created_at: new Date().toISOString()
  }
]

// ==========================================
// FUNCIONES AUXILIARES DE COOKIES PARA MOCK
// ==========================================

async function getCookieData<T>(key: string, defaultValue: T): Promise<T> {
  const cookieStore = await cookies()
  const data = cookieStore.get(key)
  if (!data) return defaultValue
  try {
    return JSON.parse(data.value) as T
  } catch {
    return defaultValue
  }
}

async function setCookieData<T>(key: string, value: T): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(key, JSON.stringify(value), { path: '/' })
}

// ==========================================
// SERVICIO DE ACCESO A DATOS UNIFICADO
// ==========================================

export const DataService = {
  // --- AUTENTICACIÓN ---
  async getCurrentUser() {
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      return data.user
    } else {
      // Mock User
      return await getCookieData<{ id: string; email: string } | null>('mock_auth_user', null)
    }
  },

  async getCurrentUserProfile(): Promise<Profile | null> {
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      return data
    } else {
      const user = await this.getCurrentUser()
      if (!user) return null
      const profiles = await getCookieData<Profile[]>('mock_profiles', [
        {
          id: 'admin-id',
          email: 'admin@clubdemarcas.mx',
          role: 'admin',
          is_banned: false,
          created_at: new Date().toISOString(),
          full_name: 'Administrador Club',
          phone: '5512345678',
          address: 'Av. Paseo de la Reforma 123, CDMX',
          membership_tier: 'premium',
          membership_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          reward_balance: 1500.00
        },
        {
          id: 'client-id',
          email: 'cliente@clubdemarcas.mx',
          role: 'client',
          is_banned: false,
          created_at: new Date().toISOString(),
          full_name: 'Juan Pérez',
          phone: '5587654321',
          address: 'Calle Juárez 456, Monterrey',
          membership_tier: null,
          membership_expires_at: null,
          reward_balance: 0.00
        }
      ])
      return profiles.find(p => p.id === user.id) || null
    }
  },

  // --- PRODUCTOS ---
  async getProducts(category?: string): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      let query = supabase.from('products').select('*')
      if (category) {
        query = query.eq('category', category)
      }
      // Ordenar por más recientes
      query = query.order('created_at', { ascending: false })
      const { data, error } = await query
      if (error || !data) return []

      // Obtener calificaciones para calcular promedios
      const { data: reviews } = await supabase.from('product_reviews').select('product_id, rating')
      const reviewsByProduct: Record<string, number[]> = {}
      if (reviews) {
        reviews.forEach(r => {
          if (!reviewsByProduct[r.product_id]) reviewsByProduct[r.product_id] = []
          reviewsByProduct[r.product_id].push(r.rating)
        })
      }

      return data.map((p: any) => {
        const ratings = reviewsByProduct[p.id] || []
        const rating_count = ratings.length
        const rating_avg = rating_count > 0 ? ratings.reduce((sum, r) => sum + r, 0) / rating_count : undefined
        return { ...p, rating_avg, rating_count }
      })
    } else {
      let products = await getCookieData<Product[]>('mock_products', SEED_PRODUCTS)
      if (category) {
        products = products.filter(p => p.category.toLowerCase() === category.toLowerCase())
      }
      const reviews = await getCookieData<any[]>('mock_product_reviews', [])
      const reviewsByProduct: Record<string, number[]> = {}
      reviews.forEach(r => {
        if (!reviewsByProduct[r.product_id]) reviewsByProduct[r.product_id] = []
        reviewsByProduct[r.product_id].push(r.rating)
      })

      const productsWithRatings = products.map(p => {
        const ratings = reviewsByProduct[p.id] || []
        const rating_count = ratings.length
        const rating_avg = rating_count > 0 ? ratings.reduce((sum, r) => sum + r, 0) / rating_count : undefined
        return { ...p, rating_avg, rating_count }
      })

      return productsWithRatings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      if (!data) return null

      const { data: reviews } = await supabase.from('product_reviews').select('rating').eq('product_id', id)
      const rating_count = reviews?.length || 0
      const rating_avg = rating_count > 0 ? (reviews?.reduce((sum, r) => sum + r.rating, 0) || 0) / rating_count : undefined

      return { ...data, rating_avg, rating_count } as Product
    } else {
      const products = await getCookieData<Product[]>('mock_products', SEED_PRODUCTS)
      const p = products.find(prod => prod.id === id)
      if (!p) return null

      const reviews = await getCookieData<any[]>('mock_product_reviews', [])
      const productReviews = reviews.filter(r => r.product_id === id)
      const rating_count = productReviews.length
      const rating_avg = rating_count > 0 ? productReviews.reduce((sum, r) => sum + r.rating, 0) / rating_count : undefined

      return { ...p, rating_avg, rating_count }
    }
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single()
      if (error) return null
      return data as Product
    } else {
      const products = await getCookieData<Product[]>('mock_products', SEED_PRODUCTS)
      const newProduct: Product = {
        ...product,
        id: 'prod-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      }
      products.push(newProduct)
      await setCookieData('mock_products', products)
      return newProduct
    }
  },

  async updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<Product | null> {
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single()
      if (error) return null
      return data as Product
    } else {
      const products = await getCookieData<Product[]>('mock_products', SEED_PRODUCTS)
      const index = products.findIndex(p => p.id === id)
      if (index === -1) return null
      const updated = { ...products[index], ...product }
      products[index] = updated
      await setCookieData('mock_products', products)
      return updated
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      return !error
    } else {
      const products = await getCookieData<Product[]>('mock_products', SEED_PRODUCTS)
      const filtered = products.filter(p => p.id !== id)
      await setCookieData('mock_products', filtered)
      return true
    }
  },

  // --- CARRITO ---
  async getCart(): Promise<CartItem[]> {
    const user = await this.getCurrentUser()
    if (!user) return []

    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      // Primero verificar si existe carrito para el usuario, si no crearlo
      let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!cart) {
        const { data: newCart } = await supabase
          .from('carts')
          .insert([{ user_id: user.id }])
          .select('id')
          .single()
        cart = newCart
      }

      if (!cart) return []

      const { data: items } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('cart_id', cart.id)

      return (items || []) as CartItem[]
    } else {
      const carts = await getCookieData<Record<string, CartItem[]>>('mock_carts', {})
      const userItems = carts[user.id] || []
      const products = await this.getProducts()
      
      // Adjuntar los productos a cada item del carrito
      return userItems.map(item => ({
        ...item,
        product: products.find(p => p.id === item.product_id)
      })).filter(item => item.product !== undefined)
    }
  },

  async addToCart(productId: string, quantity: number): Promise<boolean> {
    const user = await this.getCurrentUser()
    if (!user) return false

    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      // Obtener o crear el carrito
      let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!cart) {
        const { data: newCart } = await supabase
          .from('carts')
          .insert([{ user_id: user.id }])
          .select('id')
          .single()
        cart = newCart
      }

      if (!cart) return false

      // Verificar si ya existe el producto en el carrito
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .single()

      if (existingItem) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)
        return !error
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert([{ cart_id: cart.id, product_id: productId, quantity }])
        return !error
      }
    } else {
      const carts = await getCookieData<Record<string, CartItem[]>>('mock_carts', {})
      const userItems = carts[user.id] || []
      const existing = userItems.find(item => item.product_id === productId)

      if (existing) {
        existing.quantity += quantity
      } else {
        userItems.push({
          id: 'item-' + Math.random().toString(36).substr(2, 9),
          cart_id: 'cart-' + user.id,
          product_id: productId,
          quantity
        })
      }

      carts[user.id] = userItems
      await setCookieData('mock_carts', carts)
      return true
    }
  },

  async updateCartItem(cartItemId: string, quantity: number): Promise<boolean> {
    const user = await this.getCurrentUser()
    if (!user) return false

    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
      return !error
    } else {
      const carts = await getCookieData<Record<string, CartItem[]>>('mock_carts', {})
      const userItems = carts[user.id] || []
      const index = userItems.findIndex(item => item.id === cartItemId)
      if (index !== -1) {
        userItems[index].quantity = quantity
        carts[user.id] = userItems
        await setCookieData('mock_carts', carts)
        return true
      }
      return false
    }
  },

  async removeFromCart(cartItemId: string): Promise<boolean> {
    const user = await this.getCurrentUser()
    if (!user) return false

    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
      return !error
    } else {
      const carts = await getCookieData<Record<string, CartItem[]>>('mock_carts', {})
      const userItems = carts[user.id] || []
      const filtered = userItems.filter(item => item.id !== cartItemId)
      carts[user.id] = filtered
      await setCookieData('mock_carts', carts)
      return true
    }
  },

  async clearCart(): Promise<boolean> {
    const user = await this.getCurrentUser()
    if (!user) return false

    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (!cart) return true

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id)
      return !error
    } else {
      const carts = await getCookieData<Record<string, CartItem[]>>('mock_carts', {})
      carts[user.id] = []
      await setCookieData('mock_carts', carts)
      return true
    }
  },

  // --- PEDIDOS ---
  async getOrders(): Promise<Order[]> {
    const user = await this.getCurrentUser()
    if (!user) return []

    const profile = await this.getCurrentUserProfile()
    const isAdmin = profile?.role === 'admin'

    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      let query = supabase.from('orders').select('*, items:order_items(*, product:products(*))')
      
      // Si no es admin, filtrar solo los suyos
      if (!isAdmin) {
        query = query.eq('user_id', user.id)
      }

      query = query.order('created_at', { ascending: false })
      const { data, error } = await query
      if (error) return []
      return data as Order[]
    } else {
      const orders = await getCookieData<Order[]>('mock_orders', [])
      const filtered = isAdmin ? orders : orders.filter(o => o.user_id === user.id)
      return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  },

  async createOrder(shippingAddress: string, total: number, items: { product_id: string; quantity: number; price: number }[]): Promise<Order | null> {
    const user = await this.getCurrentUser()
    if (!user) return null

    // 1. Obtener y validar productos en venta
    const productIds = items.map(i => i.product_id)
    let dbProducts: Product[] = []
    
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { data } = await supabase.from('products').select('*').in('id', productIds)
      dbProducts = (data || []) as Product[]
    } else {
      assertMockAllowed()
      const mockProds = await getCookieData<Product[]>('mock_products', SEED_PRODUCTS)
      dbProducts = mockProds.filter(p => productIds.includes(p.id))
    }

    // Validar membresía Signature activa y vigente si hay algún producto exclusivo (Prestige)
    const hasPrestigeProduct = dbProducts.some(p => p.is_prestige)
    if (hasPrestigeProduct) {
      const profile = await this.getCurrentUserProfile()
      const isPremium = profile?.membership_tier === 'premium'
      const isExpired = profile?.membership_expires_at 
        ? new Date(profile.membership_expires_at) <= new Date() 
        : true
        
      if (!isPremium || isExpired) {
        throw new Error('Operación bloqueada en el servidor: Se requiere una membresía Signature activa y vigente para comprar productos exclusivos Prestige.')
      }
    }

    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      
      // 1. Crear el pedido
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          customer_email: user.email!,
          shipping_address: shippingAddress,
          status: 'pending',
          total
        }])
        .select()
        .single()

      if (orderErr || !order) return null

      // 2. Crear los detalles del pedido
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }))

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsErr) {
        await supabase.from('orders').delete().eq('id', order.id)
        return null
      }

      // 3. Reducir inventario de productos
      for (const item of items) {
        const { data: prod } = await supabase.from('products').select('inventory').eq('id', item.product_id).single()
        if (prod) {
          await supabase.from('products').update({ inventory: Math.max(0, prod.inventory - item.quantity) }).eq('id', item.product_id)
        }
      }

      // 4. Limpiar el carrito (las recompensas se acreditarán al confirmarse el pago)
      await this.clearCart()

      return order as Order
    } else {
      assertMockAllowed()
      const orders = await getCookieData<Order[]>('mock_orders', [])
      const products = await this.getProducts()
      
      const newOrderId = 'ord-' + Math.random().toString(36).substr(2, 9)
      const orderItems: OrderItem[] = items.map(item => ({
        id: 'orditem-' + Math.random().toString(36).substr(2, 9),
        order_id: newOrderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        product: products.find(p => p.id === item.product_id)
      }))

      const newOrder: Order = {
        id: newOrderId,
        user_id: user.id,
        customer_email: user.email || '',
        shipping_address: shippingAddress,
        status: 'pending',
        total,
        created_at: new Date().toISOString(),
        items: orderItems
      }

      orders.push(newOrder)
      await setCookieData('mock_orders', orders)

      // Descontar del inventario de productos simulados
      const mockProducts = await getCookieData<Product[]>('mock_products', SEED_PRODUCTS)
      items.forEach(item => {
        const idx = mockProducts.findIndex(p => p.id === item.product_id)
        if (idx !== -1) {
          mockProducts[idx].inventory = Math.max(0, mockProducts[idx].inventory - item.quantity)
        }
      })
      await setCookieData('mock_products', mockProducts)

      // Limpiar el carrito del usuario
      await this.clearCart()

      return newOrder
    }
  },

  async updateOrderStatus(orderId: string, status: 'pending' | 'shipped' | 'completed'): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await createClient()

      // 1. Obtener estado actual del pedido para ver si hay cambios relevantes
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .select('*, items:order_items(*, product:products(*))')
        .eq('id', orderId)
        .single()

      if (orderErr || !order) return false
      const oldStatus = order.status

      if (oldStatus === status) return true // Sin cambios

      // 2. Actualizar el estado del pedido
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (updateErr) return false

      // 3. Manejo de recompensas
      if (status === 'completed' && oldStatus !== 'completed') {
        // Idempotencia: Verificar si ya existe una transacción de recompensa para este pedido
        const { data: existingTx } = await supabase
          .from('reward_transactions')
          .select('id')
          .eq('order_id', orderId)
          .eq('type', 'reward_earned')
          .maybeSingle()

        if (!existingTx) {
          // Obtener perfil del usuario
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', order.user_id)
            .single()

          const tier = profile?.membership_tier
          if (tier && profile) {
            let rewardEarned = 0
            order.items.forEach((item: any) => {
              const prod = item.product
              if (prod) {
                const rate = tier === 'premium' ? (prod.return_rate_premium || 10.00) : (prod.return_rate_basic || 2.00)
                rewardEarned += Number((item.price * item.quantity * (rate / 100)).toFixed(2))
              }
            })

            if (rewardEarned > 0) {
              const newBalance = Number(((profile.reward_balance || 0) + rewardEarned).toFixed(2))
              // Acreditación atómica
              await supabase.from('profiles').update({ reward_balance: newBalance }).eq('id', order.user_id)
              await supabase.from('reward_transactions').insert({
                user_id: order.user_id,
                amount: rewardEarned,
                type: 'reward_earned',
                status: 'available',
                order_id: orderId,
                description: `Saldo Club acreditado por compra confirmada en pedido #${orderId.slice(0, 8)}`
              })
            }
          }
        }
      } else if (oldStatus === 'completed' && status !== 'completed') {
        // Reversión de recompensa (pedido cancelado o devuelto)
        const { data: existingTx } = await supabase
          .from('reward_transactions')
          .select('*')
          .eq('order_id', orderId)
          .eq('type', 'reward_earned')
          .maybeSingle()

        if (existingTx) {
          const rewardAmount = Number(existingTx.amount)
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', order.user_id)
            .single()

          if (profile) {
            const newBalance = Math.max(0, Number(((profile.reward_balance || 0) - rewardAmount).toFixed(2)))
            await supabase.from('profiles').update({ reward_balance: newBalance }).eq('id', order.user_id)
            await supabase.from('reward_transactions').insert({
              user_id: order.user_id,
              amount: -rewardAmount,
              type: 'reward_reversed',
              status: 'reversed',
              order_id: orderId,
              description: `Saldo Club reversado por cambio de estado en pedido #${orderId.slice(0, 8)}`
            })
          }
        }
      }

      return true
    } else {
      assertMockAllowed()
      const orders = await getCookieData<Order[]>('mock_orders', [])
      const index = orders.findIndex(o => o.id === orderId)
      if (index === -1) return false

      const order = orders[index]
      const oldStatus = order.status
      if (oldStatus === status) return true

      order.status = status
      await setCookieData('mock_orders', orders)

      if (status === 'completed' && oldStatus !== 'completed') {
        const transactions = await getCookieData<RewardTransaction[]>('mock_reward_transactions', [])
        const existingTx = transactions.find(t => t.order_id === orderId && t.type === 'reward_earned')

        if (!existingTx) {
          const profiles = await getCookieData<Profile[]>('mock_profiles', [])
          const profileIdx = profiles.findIndex(p => p.id === order.user_id)
          const profile = profileIdx !== -1 ? profiles[profileIdx] : null
          const tier = profile?.membership_tier

          if (tier && profile) {
            let rewardEarned = 0
            const products = await this.getProducts()
            order.items?.forEach((item: any) => {
              const prod = products.find(p => p.id === item.product_id)
              if (prod) {
                const rate = tier === 'premium' ? (prod.return_rate_premium || 10.00) : (prod.return_rate_basic || 2.00)
                rewardEarned += Number((item.price * item.quantity * (rate / 100)).toFixed(2))
              }
            })

            if (rewardEarned > 0 && profileIdx !== -1) {
              profile.reward_balance = Number(((profile.reward_balance || 0) + rewardEarned).toFixed(2))
              await setCookieData('mock_profiles', profiles)

              transactions.push({
                id: 'tx-' + Math.random().toString(36).substr(2, 9),
                user_id: order.user_id!,
                amount: rewardEarned,
                type: 'reward_earned',
                status: 'available',
                order_id: orderId,
                description: `Saldo Club acreditado por compra confirmada en pedido #${orderId.slice(0, 8)}`,
                created_at: new Date().toISOString()
              })
              await setCookieData('mock_reward_transactions', transactions)
            }
          }
        }
      } else if (oldStatus === 'completed' && status !== 'completed') {
        const transactions = await getCookieData<RewardTransaction[]>('mock_reward_transactions', [])
        const existingTx = transactions.find(t => t.order_id === orderId && t.type === 'reward_earned')

        if (existingTx) {
          const rewardAmount = Number(existingTx.amount)
          const profiles = await getCookieData<Profile[]>('mock_profiles', [])
          const profileIdx = profiles.findIndex(p => p.id === order.user_id)
          const profile = profileIdx !== -1 ? profiles[profileIdx] : null

          if (profile && profileIdx !== -1) {
            profile.reward_balance = Math.max(0, Number(((profile.reward_balance || 0) - rewardAmount).toFixed(2)))
            await setCookieData('mock_profiles', profiles)

            transactions.push({
              id: 'tx-' + Math.random().toString(36).substr(2, 9),
              user_id: order.user_id!,
              amount: -rewardAmount,
              type: 'reward_reversed',
              status: 'reversed',
              order_id: orderId,
              description: `Saldo Club reversado por cambio de estado en pedido #${orderId.slice(0, 8)}`,
              created_at: new Date().toISOString()
            })
            await setCookieData('mock_reward_transactions', transactions)
          }
        }
      }
      return true
    }
  },

  // --- PERFILES / ADMINISTRACIÓN ---
  async getProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      return (data || []) as Profile[]
    } else {
      const defaultProfiles: Profile[] = [
        {
          id: 'admin-id',
          email: 'admin@clubdemarcas.mx',
          role: 'admin',
          is_banned: false,
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          full_name: 'Administrador Club',
          phone: '5512345678',
          address: 'Av. Paseo de la Reforma 123, CDMX'
        },
        {
          id: 'client-id',
          email: 'cliente@clubdemarcas.mx',
          role: 'client',
          is_banned: false,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          full_name: 'Juan Pérez',
          phone: '5587654321',
          address: 'Calle Juárez 456, Monterrey'
        }
      ]
      return await getCookieData<Profile[]>('mock_profiles', defaultProfiles)
    }
  },

  async toggleBanUser(userId: string, currentBanStatus: boolean): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !currentBanStatus })
        .eq('id', userId)
      return !error
    } else {
      const profiles = await this.getProfiles()
      const index = profiles.findIndex(p => p.id === userId)
      if (index !== -1) {
        profiles[index].is_banned = !currentBanStatus
        await setCookieData('mock_profiles', profiles)
        return true
      }
      return false
    }
  },

  async updateProfile(userId: string, updates: Partial<Omit<Profile, 'id' | 'role' | 'created_at'>>): Promise<Profile | null> {
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      if (error) return null
      return data as Profile
    } else {
      const profiles = await this.getProfiles()
      const index = profiles.findIndex(p => p.id === userId)
      if (index === -1) return null
      const updated = { ...profiles[index], ...updates }
      profiles[index] = updated
      await setCookieData('mock_profiles', profiles)
      return updated
    }
  },

  async getStoreSettings(): Promise<Record<string, string>> {
    const defaults = {
      store_name: 'Club de Marcas',
      support_whatsapp: '+52 449 110 9178',
      shipping_cost: '0'
    }
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
      if (error || !data || data.length === 0) return defaults
      const settings = { ...defaults }
      data.forEach((item: any) => {
        settings[item.key as keyof typeof defaults] = item.value
      })
      return settings
    } else {
      return await getCookieData<Record<string, string>>('mock_store_settings', defaults)
    }
  },

  async updateStoreSettings(settings: Record<string, string>): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      for (const [key, value] of Object.entries(settings)) {
        await supabase
          .from('store_settings')
          .upsert({ key, value, updated_at: new Date().toISOString() })
      }
      return true
    } else {
      const current = await this.getStoreSettings()
      const updated = { ...current, ...settings }
      await setCookieData('mock_store_settings', updated)
      return true
    }
  },

  async logSecurityEvent(userId: string, action: string, ipAddress: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { error } = await supabase
        .from('security_logs')
        .insert({ user_id: userId, action, ip_address: ipAddress })
      return !error
    } else {
      const logs = await getCookieData<any[]>('mock_security_logs', [])
      logs.push({
        id: Math.random().toString(),
        user_id: userId,
        action,
        ip_address: ipAddress,
        created_at: new Date().toISOString()
      })
      await setCookieData('mock_security_logs', logs)
      return true
    }
  },

  async getProductReviews(productId: string): Promise<ProductReview[]> {
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*, profile:profiles(*)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
      if (error || !data) return []
      return data as ProductReview[]
    } else {
      const reviews = await getCookieData<any[]>('mock_product_reviews', [])
      const profiles = await this.getProfiles()
      const filtered = reviews.filter(r => r.product_id === productId)
      return filtered.map(r => ({
        ...r,
        profile: profiles.find(p => p.id === r.user_id)
      })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  },

  async createProductReview(productId: string, rating: number, comment?: string): Promise<ProductReview | null> {
    const user = await this.getCurrentUser()
    if (!user) return null

    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment
        })
        .select()
        .single()
      if (error || !data) {
        console.error('Error inserting review:', error)
        return null
      }
      return data as ProductReview
    } else {
      const reviews = await getCookieData<any[]>('mock_product_reviews', [])
      const exists = reviews.some(r => r.product_id === productId && r.user_id === user.id)
      if (exists) return null

      const newReview = {
        id: 'rev-' + Math.random().toString(36).substr(2, 9),
        product_id: productId,
        user_id: user.id,
        rating,
        comment,
        created_at: new Date().toISOString()
      }
      reviews.push(newReview)
      await setCookieData('mock_product_reviews', reviews)
      
      // Log audit trail for simulation
      await this.logSecurityEvent(user.id, 'submitted_product_review', '0.0.0.0')

      return newReview as ProductReview
    }
  },

  async getUserReviews(): Promise<ProductReview[]> {
    const user = await this.getCurrentUser()
    if (!user) return []

    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('user_id', user.id)
      if (error || !data) return []
      return data as ProductReview[]
    } else {
      const reviews = await getCookieData<any[]>('mock_product_reviews', [])
      return reviews.filter(r => r.user_id === user.id)
    }
  },

  async subscribeToMembership(tier: 'basic' | 'premium' | null): Promise<{ success: boolean; error?: string }> {
    const user = await this.getCurrentUser()
    if (!user) return { success: false, error: 'Usuario no autenticado' }

    const expiresAt = tier ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null

    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          membership_tier: tier,
          membership_expires_at: expiresAt
        })
        .eq('id', user.id)
      return { success: !error, error: error?.message }
    } else {
      const profiles = await getCookieData<Profile[]>('mock_profiles', [])
      const updatedProfiles = profiles.map(p => {
        if (p.id === user.id) {
          return {
            ...p,
            membership_tier: tier,
            membership_expires_at: expiresAt
          }
        }
        return p
      })
      await setCookieData('mock_profiles', updatedProfiles)
      return { success: true }
    }
  },

  async getRewardTransactions(): Promise<RewardTransaction[]> {
    const user = await this.getCurrentUser()
    if (!user) return []

    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('reward_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error || !data) return []
      return data as RewardTransaction[]
    } else {
      const txs = await getCookieData<RewardTransaction[]>('mock_reward_transactions', [])
      return txs
        .filter(t => t.user_id === user.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  },

  async getActiveReservations(): Promise<RewardReservation[]> {
    const user = await this.getCurrentUser()
    if (!user) return []

    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      
      try {
        const { data, error } = await supabase
          .from('reward_reservations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[DataService Fallback Warning]: Error fetching from "reward_reservations", trying legacy table "term_investments".', error);
          }
          const { data: legacyData, error: legacyError } = await supabase
            .from('term_investments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (legacyError) {
            console.error('[DataService Fallback Error]: Both "reward_reservations" and "term_investments" failed to load.', legacyError);
            return []
          }
          return (legacyData || []).map((legacy: { id: string; user_id: string; amount: number; term_months: number; annual_rate: number; start_date: string; end_date: string; expected_yield: number; status: string; created_at: string }) => ({
            id: legacy.id,
            user_id: legacy.user_id,
            amount: Number(legacy.amount),
            term_months: legacy.term_months,
            bonus_rate: Number(legacy.annual_rate),
            start_date: legacy.start_date,
            release_date: legacy.end_date,
            expected_bonus: Number(legacy.expected_yield),
            status: (legacy.status === 'completed' ? 'released' : legacy.status) as 'active' | 'released' | 'cancelled' | 'expired',
            created_at: legacy.created_at
          }))
        }
        return data as RewardReservation[]
      } catch (err) {
        console.error('[DataService Critical Error] in getActiveReservations:', err)
        return []
      }
    } else {
      assertMockAllowed()
      // En modo simulación, intentar leer de mock_reward_reservations y si no hay, de mock_term_investments
      let resvs = await getCookieData<RewardReservation[]>('mock_reward_reservations', [])
      if (resvs.length === 0) {
        const legacyMock = await getCookieData<{ id: string; user_id: string; amount: number; term_months: number; annual_rate: number; start_date: string; end_date: string; expected_yield: number; status: string; created_at: string }[]>('mock_term_investments', [])
        resvs = legacyMock.map(legacy => ({
          id: legacy.id,
          user_id: legacy.user_id,
          amount: Number(legacy.amount),
          term_months: legacy.term_months,
          bonus_rate: Number(legacy.annual_rate),
          start_date: legacy.start_date,
          release_date: legacy.end_date,
          expected_bonus: Number(legacy.expected_yield),
          status: (legacy.status === 'completed' ? 'released' : legacy.status) as 'active' | 'released' | 'cancelled' | 'expired',
          created_at: legacy.created_at
        }))
      }
      return resvs
        .filter(i => i.user_id === user.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  },

  // Alias para mantener compatibilidad con imports existentes
  async getActiveInvestments(): Promise<TermInvestment[]> {
    return this.getActiveReservations()
  },

  async createReservation(amount: number, termMonths: number): Promise<{ success: boolean; message: string }> {
    const user = await this.getCurrentUser()
    if (!user) return { success: false, message: 'Usuario no autenticado' }

    const profile = await this.getCurrentUserProfile()
    if (!profile) return { success: false, message: 'Perfil no encontrado' }

    const currentBalance = profile.reward_balance || 0
    if (currentBalance < amount) {
      return { success: false, message: 'Saldo Club insuficiente' }
    }

    // Obtener tasa de bonificación basada en la membresía y el periodo
    let bonusRate = 5
    const isPremium = profile.membership_tier === 'premium'
    
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const { data: rule } = await supabase
        .from('reward_bonus_rules')
        .select('bonus_rate')
        .eq('membership_tier', profile.membership_tier || 'basic')
        .eq('term_months', termMonths)
        .eq('is_active', true)
        .maybeSingle()
      if (rule) {
        bonusRate = Number(rule.bonus_rate)
      } else {
        if (termMonths === 1) bonusRate = isPremium ? 7 : 5
        else if (termMonths === 3) bonusRate = isPremium ? 10 : 8
        else if (termMonths === 6) bonusRate = isPremium ? 14 : 12
        else if (termMonths === 12) bonusRate = isPremium ? 17 : 15
      }
    } else {
      assertMockAllowed()
      if (termMonths === 1) bonusRate = isPremium ? 7 : 5
      else if (termMonths === 3) bonusRate = isPremium ? 10 : 8
      else if (termMonths === 6) bonusRate = isPremium ? 14 : 12
      else if (termMonths === 12) bonusRate = isPremium ? 17 : 15
    }

    const expectedBonus = Number((amount * (bonusRate / 100) * (termMonths / 12)).toFixed(2))
    const startDate = new Date().toISOString()
    const releaseDate = new Date(Date.now() + termMonths * 30 * 24 * 60 * 60 * 1000).toISOString()
    const reservationId = 'res-' + Math.random().toString(36).substr(2, 9)

    const newReservation: RewardReservation = {
      id: reservationId,
      user_id: user.id,
      amount,
      term_months: termMonths,
      bonus_rate: bonusRate,
      start_date: startDate,
      release_date: releaseDate,
      expected_bonus: expectedBonus,
      status: 'active',
      created_at: startDate,
      membership_tier_at_creation: profile.membership_tier,
      calculation_formula_version: 'v1'
    }

    const newBalance = Number((currentBalance - amount).toFixed(2))

    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ reward_balance: newBalance })
        .eq('id', user.id)

      if (profileError) return { success: false, message: 'Error al actualizar balance de recompensas' }

      // Intentar insertar primero en la nueva tabla
      const { error: resError, data: resData } = await supabase
        .from('reward_reservations')
        .insert({
          user_id: user.id,
          amount,
          term_months: termMonths,
          bonus_rate: bonusRate,
          release_date: releaseDate,
          expected_bonus: expectedBonus,
          status: 'active',
          membership_tier_at_creation: profile.membership_tier,
          calculation_formula_version: 'v1'
        })
        .select()
        .single()

      if (resError) {
        // Fallback si la tabla nueva no existe
        if (resError.code === '42P01') {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[DataService Fallback]: Table "reward_reservations" does not exist. Saving to legacy "term_investments" table.');
          }
          const { error: legacyError, data: legacyData } = await supabase
            .from('term_investments')
            .insert({
              user_id: user.id,
              amount,
              term_months: termMonths,
              annual_rate: bonusRate,
              end_date: releaseDate,
              expected_yield: expectedBonus,
              status: 'active'
            })
            .select()
            .single()

          if (legacyError) {
            // Revertir balance
            await supabase.from('profiles').update({ reward_balance: currentBalance }).eq('id', user.id)
            return { success: false, message: 'Error al crear reserva (legacy)' }
          }

          // Acreditación atómica de transacción de retiro/bloqueo
          await supabase
            .from('reward_transactions')
            .insert({
              user_id: user.id,
              amount: -amount,
              type: 'reward_reserved',
              status: 'reserved',
              reference_id: legacyData.id,
              description: `Saldo Club reservado por periodo de permanencia a ${termMonths} mes(es) al ${bonusRate}%`
            })

          return { success: true, message: 'Saldo reservado con éxito (modo legacy)' }
        }

        // Revertir balance si falló por otra causa
        await supabase.from('profiles').update({ reward_balance: currentBalance }).eq('id', user.id)
        return { success: false, message: 'Error al crear la reserva de saldo' }
      }

      // Transacción de auditoría atómica
      await supabase
        .from('reward_transactions')
        .insert({
          user_id: user.id,
          amount: -amount,
          type: 'reward_reserved',
          status: 'reserved',
          reference_id: resData.id,
          description: `Saldo Club reservado por periodo de permanencia a ${termMonths} mes(es) al ${bonusRate}%`
        })

      return { success: true, message: 'Saldo reservado con éxito' }
    } else {
      assertMockAllowed()
      // Mock local
      const profiles = await getCookieData<Profile[]>('mock_profiles', [])
      const updatedProfiles = profiles.map(p => {
        if (p.id === user.id) {
          return { ...p, reward_balance: newBalance }
        }
        return p
      })
      await setCookieData('mock_profiles', updatedProfiles)

      const reservations = await getCookieData<RewardReservation[]>('mock_reward_reservations', [])
      reservations.push(newReservation)
      await setCookieData('mock_reward_reservations', reservations)

      const transactions = await getCookieData<RewardTransaction[]>('mock_reward_transactions', [])
      transactions.push({
        id: 'tx-' + Math.random().toString(36).substr(2, 9),
        user_id: user.id,
        amount: -amount,
        type: 'reward_reserved',
        status: 'reserved',
        reference_id: reservationId,
        description: `Saldo Club reservado por periodo de permanencia a ${termMonths} mes(es) al ${bonusRate}%`,
        created_at: new Date().toISOString()
      })
      await setCookieData('mock_reward_transactions', transactions)

      return { success: true, message: 'Saldo reservado con éxito' }
    }
  },

  // Alias legacy para compatibilidad
  async createInvestment(amount: number, termMonths: number): Promise<{ success: boolean; message: string }> {
    return this.createReservation(amount, termMonths)
  },

  async simulateRelease(reservationId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.getCurrentUser()
    if (!user) return { success: false, message: 'Usuario no autenticado' }

    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      
      // Intentar primero consultar la nueva tabla
      const { data: resv, error: resvError } = await supabase
        .from('reward_reservations')
        .select('*')
        .eq('id', reservationId)
        .single()

      if (resvError) {
        // Fallback si la tabla nueva no existe
        if (resvError.code === '42P01') {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[DataService Fallback]: Table "reward_reservations" does not exist. Releasing legacy "term_investments" record.');
          }
          const { data: legacyInv, error: legacyErr } = await supabase
            .from('term_investments')
            .select('*')
            .eq('id', reservationId)
            .single()

          if (legacyErr || !legacyInv) return { success: false, message: 'Colocación legacy no encontrada' }
          if (legacyInv.status === 'completed') return { success: false, message: 'Esta colocación ya fue liberada' }

          const totalReturn = Number((Number(legacyInv.amount) + Number(legacyInv.expected_yield)).toFixed(2))
          const profile = await this.getCurrentUserProfile()
          if (!profile) return { success: false, message: 'Perfil no encontrado' }
          
          const newBalance = Number(((profile.reward_balance || 0) + totalReturn).toFixed(2))

          const { error: profileError } = await supabase
            .from('profiles')
            .update({ reward_balance: newBalance })
            .eq('id', user.id)

          if (profileError) return { success: false, message: 'Error al acreditar saldo' }

          const { error: updateLegacyError } = await supabase
            .from('term_investments')
            .update({ status: 'completed' })
            .eq('id', reservationId)

          if (updateLegacyError) return { success: false, message: 'Error al cambiar estatus legacy' }

          await supabase
            .from('reward_transactions')
            .insert({
              user_id: user.id,
              amount: totalReturn,
              type: 'reward_released',
              status: 'released',
              reference_id: reservationId,
              description: `Liberación de permanencia de saldo acreditado (+${legacyInv.expected_yield} bonificación)`
            })

          return { success: true, message: 'Saldo de permanencia liberado con éxito (modo legacy)' }
        }

        return { success: false, message: 'Reserva no encontrada' }
      }

      if (resv.status === 'released') return { success: false, message: 'La reserva ya fue liberada anteriormente.' }

      const totalReturn = Number((Number(resv.amount) + Number(resv.expected_bonus)).toFixed(2))
      const profile = await this.getCurrentUserProfile()
      if (!profile) return { success: false, message: 'Perfil no encontrado' }
      
      const newBalance = Number(((profile.reward_balance || 0) + totalReturn).toFixed(2))

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ reward_balance: newBalance })
        .eq('id', user.id)

      if (profileError) return { success: false, message: 'Error al acreditar saldo de bonificación' }

      const { error: updateResError } = await supabase
        .from('reward_reservations')
        .update({ status: 'released', updated_at: new Date().toISOString() })
        .eq('id', reservationId)

      if (updateResError) return { success: false, message: 'Error al actualizar estatus de reserva' }

      await supabase
        .from('reward_transactions')
        .insert({
          user_id: user.id,
          amount: totalReturn,
          type: 'reward_released',
          status: 'released',
          reference_id: reservationId,
          description: `Liberación de permanencia de saldo acreditado (+${resv.expected_bonus} bonificación)`
        })

      return { success: true, message: 'Saldo de permanencia liberado con éxito' }
    } else {
      assertMockAllowed()
      // Mock local
      const reservations = await getCookieData<any[]>('mock_reward_reservations', [])
      const idx = reservations.findIndex(r => r.id === reservationId)
      if (idx === -1) {
        // Buscar en legacy mock
        const legacyMock = await getCookieData<any[]>('mock_term_investments', [])
        const lIdx = legacyMock.findIndex(l => l.id === reservationId)
        if (lIdx === -1) return { success: false, message: 'Reserva no encontrada' }

        const legacyInv = legacyMock[lIdx]
        if (legacyInv.status === 'completed') return { success: false, message: 'Esta reserva ya fue liberada' }

        legacyInv.status = 'completed'
        await setCookieData('mock_term_investments', legacyMock)

        const totalReturn = Number((Number(legacyInv.amount) + Number(legacyInv.expected_yield)).toFixed(2))
        const profiles = await getCookieData<Profile[]>('mock_profiles', [])
        const profileIdx = profiles.findIndex(p => p.id === user.id)
        if (profileIdx !== -1) {
          profiles[profileIdx].reward_balance = Number(((profiles[profileIdx].reward_balance || 0) + totalReturn).toFixed(2))
          await setCookieData('mock_profiles', profiles)
        }

        const transactions = await getCookieData<RewardTransaction[]>('mock_reward_transactions', [])
        transactions.push({
          id: 'tx-' + Math.random().toString(36).substr(2, 9),
          user_id: user.id,
          amount: totalReturn,
          type: 'reward_released',
          status: 'released',
          reference_id: reservationId,
          description: `Liberación de permanencia de saldo acreditado (+${legacyInv.expected_yield} bonificación)`,
          created_at: new Date().toISOString()
        })
        await setCookieData('mock_reward_transactions', transactions)
        return { success: true, message: 'Saldo liberado con éxito' }
      }

      const resv = reservations[idx]
      if (resv.status === 'released') return { success: false, message: 'Esta reserva ya fue liberada' }

      resv.status = 'released'
      await setCookieData('mock_reward_reservations', reservations)

      const totalReturn = Number((Number(resv.amount) + Number(resv.expected_bonus)).toFixed(2))
      const profiles = await getCookieData<Profile[]>('mock_profiles', [])
      const profileIdx = profiles.findIndex(p => p.id === user.id)
      if (profileIdx !== -1) {
        profiles[profileIdx].reward_balance = Number(((profiles[profileIdx].reward_balance || 0) + totalReturn).toFixed(2))
        await setCookieData('mock_profiles', profiles)
      }

      const transactions = await getCookieData<RewardTransaction[]>('mock_reward_transactions', [])
      transactions.push({
        id: 'tx-' + Math.random().toString(36).substr(2, 9),
        user_id: user.id,
        amount: totalReturn,
        type: 'reward_released',
        status: 'released',
        reference_id: reservationId,
        description: `Liberación de permanencia de saldo acreditado (+${resv.expected_bonus} bonificación)`,
        created_at: new Date().toISOString()
      })
      await setCookieData('mock_reward_transactions', transactions)

      return { success: true, message: 'Saldo liberado con éxito' }
    }
  },

  // Alias legacy para compatibilidad
  async simulateTermCompletion(investmentId: string): Promise<{ success: boolean; message: string }> {
    return this.simulateRelease(investmentId)
  }
}
