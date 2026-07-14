'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
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
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
    if (isProduction) {
      return { error: 'El modo simulación está deshabilitado en producción.' }
    }

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
  
  const termsAccepted = formData.get('terms_accepted') === 'on' || formData.get('terms_accepted') === 'true'
  const privacyAccepted = formData.get('privacy_accepted') === 'on' || formData.get('privacy_accepted') === 'true'

  if (!email || !password) {
    return { error: 'Por favor, completa todos los campos.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden.' }
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  if (!termsAccepted || !privacyAccepted) {
    return { error: 'Debes aceptar los Términos y Condiciones y el Aviso de Privacidad.' }
  }

  const headerList = await headers()
  const ipAddress = headerList.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'

  const configured = isSupabaseConfigured()

  if (configured) {
    const supabase = await createSupabaseClient()
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          terms_accepted: true,
          privacy_accepted: true,
          accepted_at: new Date().toISOString(),
          legal_version: 'v1.0'
        }
      },
    })

    if (error) {
      return { error: `Error de registro: ${error.message}` }
    }

    // Registrar bitácora de seguridad si el usuario se creó correctamente
    if (user) {
      await supabase.from('security_logs').insert({
        user_id: user.id,
        action: 'accepted_terms_and_privacy',
        ip_address: ipAddress
      })
    }

    return { success: 'Registro exitoso. Si se requiere confirmación por correo, revisa tu bandeja de entrada.' }
  } else {
    // Modo Simulación (Mock)
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
    if (isProduction) {
      return { error: 'El modo simulación está deshabilitado en producción.' }
    }

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
      terms_accepted: true,
      privacy_accepted: true,
      accepted_at: new Date().toISOString(),
      legal_version: 'v1.0',
      created_at: new Date().toISOString()
    }

    mockProfiles.push(newProfile)
    cookieStore.set('mock_profiles', JSON.stringify(mockProfiles), { path: '/' })
    
    // Registrar bitácora de seguridad en el modo simulado
    await DataService.logSecurityEvent(newId, 'accepted_terms_and_privacy', ipAddress)

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
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
    if (isProduction) {
      nextRedirect('/login')
    }

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
  
  const is_prestige = formData.get('is_prestige') === 'on' || formData.get('is_prestige') === 'true'
  const return_rate_basic = parseFloat(formData.get('return_rate_basic') as string) || 2.00
  const return_rate_premium = parseFloat(formData.get('return_rate_premium') as string) || 10.00

  let image_url = imageUrlInput || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop'

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
    image_url,
    is_prestige,
    return_rate_basic,
    return_rate_premium
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

  const is_prestige = formData.get('is_prestige') === 'on' || formData.get('is_prestige') === 'true'
  const return_rate_basic = parseFloat(formData.get('return_rate_basic') as string) || 2.00
  const return_rate_premium = parseFloat(formData.get('return_rate_premium') as string) || 10.00

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
    is_prestige,
    return_rate_basic,
    return_rate_premium,
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

export async function updateProfileAction(prevState: any, formData: FormData) {
  const user = await DataService.getCurrentUser()
  if (!user) {
    return { error: 'No estás autenticado.' }
  }

  const full_name = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const avatarFile = formData.get('avatar_file') as File | null

  let avatar_url = formData.get('current_avatar_url') as string || undefined

  if (avatarFile && avatarFile.name && avatarFile.size > 0) {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createSupabaseClient()
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}-${Math.random()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          return { error: `Error al subir la fotografía a Supabase Storage: ${uploadError.message}` }
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)
        avatar_url = publicUrl
      } catch (e) {
        console.error('Error de red al subir avatar:', e)
        return { error: 'Error de red al subir la fotografía de perfil.' }
      }
    } else {
      // Modo simulación: usar una imagen mock para pruebas rápidas
      avatar_url = `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1534528741775-53994a69daeb' : '1494790108377-be9c29b29330'}?w=150&auto=format&fit=crop`
    }
  }

  const updatedProfile = await DataService.updateProfile(user.id, {
    full_name,
    phone,
    address,
    ...(avatar_url ? { avatar_url } : {})
  })

  if (updatedProfile) {
    return { 
      success: 'Perfil actualizado correctamente.', 
      avatarUrl: avatar_url 
    }
  } else {
    return { error: 'Error al actualizar el perfil en la base de datos.' }
  }
}

export async function updateStoreSettingsAction(prevState: any, formData: FormData) {
  const user = await DataService.getCurrentUser()
  if (!user) {
    return { error: 'No estás autenticado.' }
  }
  const profile = await DataService.getCurrentUserProfile()
  if (!profile || profile.role !== 'admin') {
    return { error: 'No tienes permisos de administrador.' }
  }

  const store_name = formData.get('store_name') as string
  const support_whatsapp = formData.get('support_whatsapp') as string
  const shipping_cost = formData.get('shipping_cost') as string

  const success = await DataService.updateStoreSettings({
    store_name,
    support_whatsapp,
    shipping_cost
  })

  if (success) {
    return { success: 'Ajustes de la tienda actualizados correctamente.' }
  } else {
    return { error: 'Error al guardar los ajustes.' }
  }
}

export async function createProductReviewAction(prevState: any, formData: FormData) {
  const user = await DataService.getCurrentUser()
  if (!user) {
    return { error: 'No estás autenticado.' }
  }

  const productId = formData.get('product_id') as string
  const ratingStr = formData.get('rating') as string
  const comment = formData.get('comment') as string

  if (!productId || !ratingStr) {
    return { error: 'Datos de calificación faltantes.' }
  }

  const rating = parseInt(ratingStr, 10)
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { error: 'La calificación debe ser entre 1 y 5 estrellas.' }
  }

  const review = await DataService.createProductReview(productId, rating, comment)

  if (review) {
    revalidatePath('/profile')
    revalidatePath('/')
    return { success: '¡Gracias por calificar el producto!' }
  } else {
    return { error: 'No se pudo registrar la calificación. Tal vez ya calificaste este producto.' }
  }
}

export async function subscribeToMembershipAction(tier: 'basic' | 'premium' | null) {
  const result = await DataService.subscribeToMembership(tier)
  if (result.success) {
    revalidatePath('/profile')
    revalidatePath('/vault')
    revalidatePath('/memberships')
    revalidatePath('/')
    return { success: true }
  }
  return { success: false, error: result.error || 'No se pudo actualizar tu membresía. Intenta de nuevo.' }
}

export async function createReservationAction(_amount: number, _termMonths: number) {
  return { success: false, error: 'Esta operación está temporalmente inhabilitada por falta de contratos financieros y regulación.' }
  
  // Código preservado para futura activación:
  /*
  const result = await DataService.createReservation(amount, termMonths)
  if (result.success) {
    revalidatePath('/profile')
    revalidatePath('/vault')
    return { success: true }
  }
  return { success: false, error: result.message }
  */
}

// Alias legacy para compatibilidad
export async function createInvestmentAction(amount: number, termMonths: number) {
  return createReservationAction(amount, termMonths)
}

export async function simulateReleaseAction(_reservationId: string) {
  return { success: false, error: 'La liberación de saldo y rendimientos está temporalmente inhabilitada por falta de contratos financieros.' }

  // Código preservado para futura activación:
  /*
  const result = await DataService.simulateRelease(reservationId)
  if (result.success) {
    revalidatePath('/profile')
    revalidatePath('/vault')
    return { success: true }
  }
  return { success: false, error: result.message }
  */
}

// Alias legacy para compatibilidad
export async function simulateTermCompletionAction(investmentId: string) {
  return simulateReleaseAction(investmentId)
}

export async function saveCarouselSlideAction(formData: FormData) {
  const profile = await DataService.getCurrentUserProfile()
  if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
    return { error: 'No tienes permisos de administrador.' }
  }

  const id = formData.get('id') as string || undefined
  const title = formData.get('title') as string
  const subtitle = formData.get('subtitle') as string || undefined
  const tag = formData.get('tag') as string || undefined
  const link = formData.get('link') as string
  const cta = formData.get('cta') as string || undefined
  const color = formData.get('color') as string || undefined
  const is_active = formData.get('is_active') === 'true'
  const published_at = formData.get('published_at') as string
  const expires_at = formData.get('expires_at') as string || null

  const imageFile = formData.get('image_file') as File | null
  let image_url = formData.get('image_url') as string || ''

  if (!title || !link) {
    return { error: 'El título y el enlace son requerimientos obligatorios.' }
  }

  try {
    if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
      image_url = await DataService.uploadCarouselImage(imageFile)
    }
  } catch (e: any) {
    return { error: e.message || 'Error al subir el archivo de imagen.' }
  }

  if (!image_url) {
    return { error: 'Debes proporcionar una imagen (subir un archivo o URL).' }
  }

  const result = await DataService.saveCarouselSlide({
    id,
    title,
    subtitle,
    tag,
    image_url,
    link,
    cta,
    color,
    is_active,
    published_at,
    expires_at: expires_at || null
  })

  if (result.success) {
    revalidatePath('/')
    revalidatePath('/admin/carousel')
    return { success: result.message }
  } else {
    return { error: result.message }
  }
}

export async function deleteCarouselSlideAction(id: string) {
  const profile = await DataService.getCurrentUserProfile()
  if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
    return { error: 'No tienes permisos de administrador.' }
  }

  if (!id) return { error: 'Identificador faltante.' }

  const result = await DataService.deleteCarouselSlide(id)
  if (result.success) {
    revalidatePath('/')
    revalidatePath('/admin/carousel')
    return { success: true }
  }
  return { error: result.message }
}


