import { createClient } from './supabase/server'
import { cookies } from 'next/headers'

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!url && url !== '' && url !== 'https://placeholder.supabase.co'
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
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  original_price?: number
  inventory: number
  category: 'Tenis' | 'Relojes' | 'Gorras' | 'Lentes' | 'Bolsas' | 'Cuidado Personal'
  image_url?: string
  created_at: string
  rating_avg?: number
  rating_count?: number
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
    description: 'Los icónicos tenis de correr con amortiguación Air Max visible, ideales para el uso diario.',
    price: 2499.00,
    original_price: 3199.00,
    inventory: 25,
    category: 'Tenis',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-2',
    title: 'Adidas Ultraboost Light',
    description: 'Tenis de running de alto rendimiento con retorno de energía Boost y comodidad Primeknit.',
    price: 3499.00,
    original_price: 4299.00,
    inventory: 18,
    category: 'Tenis',
    image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-3',
    title: 'Puma Slipstream Classic',
    description: 'Tenis retro de básquetbol de piel con un diseño limpio y moderno para el estilo de vida urbano.',
    price: 1899.00,
    inventory: 15,
    category: 'Tenis',
    image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-4',
    title: 'Seiko 5 Sports Automatic',
    description: 'Reloj automático japonés con caja de acero inoxidable, carátula negra y resistencia al agua de 100m.',
    price: 5800.00,
    original_price: 7200.00,
    inventory: 8,
    category: 'Relojes',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-5',
    title: 'Casio G-Shock GA-2100',
    description: 'El famoso "CasiOak" con estructura de carbono octagonal, ultra resistente y ligero.',
    price: 2199.00,
    original_price: 2699.00,
    inventory: 30,
    category: 'Relojes',
    image_url: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-6',
    title: 'New Era 59FIFTY NY Yankees',
    description: 'Gorra cerrada clásica estructurada con el logotipo bordado de los Yankees de Nueva York.',
    price: 799.00,
    original_price: 999.00,
    inventory: 40,
    category: 'Gorras',
    image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-7',
    title: 'Ray-Ban Wayfarer Classic',
    description: 'Lentes de sol icónicos con armazón de acetato negro brillante y micas verdes clásicas G-15.',
    price: 2999.00,
    original_price: 3799.00,
    inventory: 12,
    category: 'Lentes',
    image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-8',
    title: 'Coach Charter Crossbody',
    description: 'Bolsa cruzada de piel granulada con compartimentos con cierre y correa ajustable para hombro.',
    price: 5600.00,
    original_price: 6800.00,
    inventory: 6,
    category: 'Bolsas',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-9',
    title: 'Minoxidil Kirkland 5% (Paquete de 3)',
    description: 'Tratamiento de crecimiento de cabello y barba para hombres, suministro para 3 meses.',
    price: 699.00,
    original_price: 999.00,
    inventory: 50,
    category: 'Cuidado Personal',
    image_url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop',
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
          address: 'Av. Paseo de la Reforma 123, CDMX'
        },
        {
          id: 'client-id',
          email: 'cliente@clubdemarcas.mx',
          role: 'client',
          is_banned: false,
          created_at: new Date().toISOString(),
          full_name: 'Juan Pérez',
          phone: '5587654321',
          address: 'Calle Juárez 456, Monterrey'
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
        // En un escenario real, haríamos rollback, pero en supabase simple podemos eliminar la orden
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

      // 4. Limpiar el carrito
      await this.clearCart()

      return order as Order
    } else {
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
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
      return !error
    } else {
      const orders = await getCookieData<Order[]>('mock_orders', [])
      const index = orders.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders[index].status = status
        await setCookieData('mock_orders', orders)
        return true
      }
      return false
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
      support_whatsapp: '+52 (55) 1234-5678',
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
  }
}
