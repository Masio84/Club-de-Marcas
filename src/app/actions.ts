'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/utils/supabase/server'
import { DataService, type Product, type Profile } from '@/utils/data-service'

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!url && url !== '' && url !== 'https://placeholder.supabase.co'
}

const nextRedirect = redirect

// ==========================================
// ACCIONES DE AUTENTICACIÓN
// ==========================================

export async function signInAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Por favor, introduce correo y contraseña.' }
  }

  const configured = isSupabaseConfigured()

  if (configured) {
    const supabase = await createSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: `Error de inicio de sesión: ${error.message}` }
    }

    // Consultar el perfil para redirección por rol
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_banned')
      .eq('email', email)
      .single()

    if (profile?.is_banned) {
      await supabase.auth.signOut()
      return { error: 'Esta cuenta ha sido suspendida. Contacta al soporte.' }
    }

    if (profile?.role === 'admin') {
      nextRedirect('/admin/dashboard')
    } else {
      nextRedirect('/')
    }
  } else {
    // Modo Simulación (Mock)
    const cookieStore = await cookies()
    const mockProfiles = await DataService.getProfiles()
    
    // Si es un email cualquiera que no existe, lo creamos como cliente para facilitar pruebas rápidas
    let profile = mockProfiles.find(p => p.email.toLowerCase() === email.toLowerCase())
    
    if (!profile) {
      // Registrar automáticamente en simulación para agilizar testing
      const newId = 'user-' + Math.random().toString(36).substr(2, 9)
      const isFirst = mockProfiles.length === 0
      const newProfile: Profile = {
        id: newId,
        email,
        role: isFirst ? 'admin' : (email.includes('admin') ? 'admin' : 'client'),
        is_banned: false,
        created_at: new Date().toISOString()
      }
      mockProfiles.push(newProfile)
      cookieStore.set('mock_profiles', JSON.stringify(mockProfiles), { path: '/' })
      profile = newProfile
    }

    if (profile.is_banned) {
      return { error: 'Esta cuenta simulada ha sido suspendida.' }
    }

    // Guardar usuario en cookies de sesión
    cookieStore.set('mock_auth_user', JSON.stringify({ id: profile.id, email: profile.email }), { path: '/' })
    cookieStore.set('mock_user_role', profile.role, { path: '/' })

    if (profile.role === 'admin') {
      nextRedirect('/admin/dashboard')
    } else {
      nextRedirect('/')
    }
  }
}

export async function signUpAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!email || !password) {
    return { error: 'Por favor, completa todos los campos.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden.' }
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  const configured = isSupabaseConfigured()

  if (configured) {
    const supabase = await createSupabaseClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) {
      return { error: `Error de registro: ${error.message}` }
    }

    return { success: 'Registro exitoso. Si se requiere confirmación por correo, revisa tu bandeja de entrada.' }
  } else {
    // Modo Simulación (Mock)
    const cookieStore = await cookies()
    const mockProfiles = await DataService.getProfiles()

    const exists = mockProfiles.some(p => p.email.toLowerCase() === email.toLowerCase())
    if (exists) {
      return { error: 'El correo electrónico ya está registrado.' }
    }

    const newId = 'user-' + Math.random().toString(36).substr(2, 9)
    const isFirst = mockProfiles.length === 0 // Primer usuario registrado es admin
    const newProfile: Profile = {
      id: newId,
      email,
      role: isFirst ? 'admin' : 'client',
      is_banned: false,
      created_at: new Date().toISOString()
    }

    mockProfiles.push(newProfile)
    cookieStore.set('mock_profiles', JSON.stringify(mockProfiles), { path: '/' })
    
    // Iniciar sesión automáticamente
    cookieStore.set('mock_auth_user', JSON.stringify({ id: newProfile.id, email: newProfile.email }), { path: '/' })
    cookieStore.set('mock_user_role', newProfile.role, { path: '/' })

    if (newProfile.role === 'admin') {
      nextRedirect('/admin/dashboard')
    } else {
      nextRedirect('/')
    }
  }
}

export async function signOutAction() {
  const configured = isSupabaseConfigured()

  if (configured) {
    const supabase = await createSupabaseClient()
    await supabase.auth.signOut()
  } else {
    // Modo Simulación
    const cookieStore = await cookies()
    cookieStore.delete('mock_auth_user')
    cookieStore.delete('mock_user_role')
  }

  nextRedirect('/login')
}

// ==========================================
// ACCIONES DE PRODUCTOS (CRUD)
// ==========================================

export async function addProductAction(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const originalPriceVal = formData.get('original_price') as string
  const original_price = originalPriceVal ? parseFloat(originalPriceVal) : undefined
  const inventory = parseInt(formData.get('inventory') as string)
  const category = formData.get('category') as any
  const imageUrlInput = formData.get('image_url') as string
  
  let image_url = imageUrlInput || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop'

  // Simulación o subida real de archivos
  const imageFile = formData.get('image_file') as File | null
  
  if (imageFile && imageFile.name && imageFile.size > 0 && isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseClient()
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)
        image_url = publicUrl
      }
    } catch (e) {
      console.error('Error al subir imagen, usando predeterminada:', e)
    }
  }

  await DataService.createProduct({
    title,
    description,
    price,
    original_price,
    inventory,
    category,
    image_url
  })

  nextRedirect('/admin/products')
}

export async function updateProductAction(formData: FormData) {
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const originalPriceVal = formData.get('original_price') as string
  const original_price = originalPriceVal ? parseFloat(originalPriceVal) : undefined
  const inventory = parseInt(formData.get('inventory') as string)
  const category = formData.get('category') as any
  const imageUrlInput = formData.get('image_url') as string

  let image_url = imageUrlInput

  const imageFile = formData.get('image_file') as File | null
  if (imageFile && imageFile.name && imageFile.size > 0 && isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseClient()
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)
        image_url = publicUrl
      }
    } catch (e) {
      console.error('Error al actualizar imagen:', e)
    }
  }

  await DataService.updateProduct(id, {
    title,
    description,
    price,
    original_price,
    inventory,
    category,
    ...(image_url ? { image_url } : {})
  })

  nextRedirect('/admin/products')
}

export async function deleteProductAction(id: string) {
  await DataService.deleteProduct(id)
  nextRedirect('/admin/products')
}

// ==========================================
// ACCIONES DEL CARRITO
// ==========================================

export async function addToCartAction(productId: string, quantity: number = 1) {
  const success = await DataService.addToCart(productId, quantity)
  return { success }
}

export async function updateCartItemAction(cartItemId: string, quantity: number) {
  const success = await DataService.updateCartItem(cartItemId, quantity)
  return { success }
}

export async function removeFromCartAction(cartItemId: string) {
  const success = await DataService.removeFromCart(cartItemId)
  return { success }
}

// ==========================================
// ACCIONES DE PEDIDOS Y CLIENTES
// ==========================================

export async function createOrderAction(shippingAddress: string, total: number, items: { product_id: string; quantity: number; price: number }[]) {
  const order = await DataService.createOrder(shippingAddress, total, items)
  if (order) {
    return { success: true, orderId: order.id }
  }
  return { success: false, error: 'Hubo un problema al crear tu pedido. Verifica inventario o sesión.' }
}

export async function updateOrderStatusAction(orderId: string, status: 'pending' | 'shipped' | 'completed') {
  const success = await DataService.updateOrderStatus(orderId, status)
  return { success }
}

export async function toggleBanUserAction(userId: string, currentBanStatus: boolean) {
  const success = await DataService.toggleBanUser(userId, currentBanStatus)
  return { success }
}
