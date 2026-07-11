import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/proxy'

export async function proxy(request: NextRequest) {
  // Actualizar sesión de cookies de Supabase
  const res = await updateSession(request)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isConfigured = url && url !== 'https://placeholder.supabase.co'
  const path = request.nextUrl.pathname

  // Proteger rutas de administración (/admin/*)
  if (path.startsWith('/admin')) {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
    if (isProduction && !isConfigured) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isConfigured) {
      const { createServerClient } = await import('@supabase/ssr')
      const supabase = createServerClient(
        url,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll() {},
          },
        }
      )

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Validar rol en base de datos
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_banned')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin' || profile.is_banned) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } else {
      // Si no está configurado en desarrollo, validar sesión mock para admin
      const mockAuthUser = request.cookies.get('mock_auth_user')?.value
      const mockUserRole = request.cookies.get('mock_user_role')?.value
      if (!mockAuthUser || mockUserRole !== 'admin') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto recursos estáticos e imágenes.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
