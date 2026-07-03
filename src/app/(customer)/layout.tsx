import React from 'react'
import Link from 'next/link'
import { ShoppingCart, User, ShieldAlert, LogOut, LayoutDashboard, ShoppingBag } from 'lucide-react'
import { DataService } from '@/utils/data-service'
import { signOutAction } from '@/app/actions'
import SearchBar from '@/components/SearchBar'

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!url && url !== '' && url !== 'https://placeholder.supabase.co'
}

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch user session & profile
  const user = await DataService.getCurrentUser()
  const profile = await DataService.getCurrentUserProfile()
  const cartItems = await DataService.getCart()
  const allProducts = await DataService.getProducts()

  // Calcular cantidad total de productos en el carrito
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  
  // Categorías de e-commerce solicitadas
  const categories = [
    { name: 'Tenis', slug: 'Tenis' },
    { name: 'Relojes', slug: 'Relojes' },
    { name: 'Gorras', slug: 'Gorras' },
    { name: 'Lentes', slug: 'Lentes' },
    { name: 'Bolsas', slug: 'Bolsas' },
    { name: 'Cuidado Personal', slug: 'Cuidado Personal' },
  ]

  const dbConfigured = isSupabaseConfigured()

  return (
    <div className="flex flex-col min-h-screen bg-light-grey">
      {/* AVISO DE CONFIGURACIÓN DE BASE DE DATOS (MOCK MODE) */}
      {!dbConfigured && (
        <div className="bg-amber-500 text-navy py-1.5 px-4 text-xs font-semibold text-center flex items-center justify-center space-x-2 shadow-inner z-50">
          <ShieldAlert className="w-4 h-4 animate-pulse flex-shrink-0" />
          <span>
            Modo Simulación Activo: Usando almacenamiento local. Para conectar tu base de datos Supabase ejecuta <b>schema.sql</b> y configura tus variables .env
          </span>
        </div>
      )}

      {/* NAVBAR PRINCIPAL (Estilo Mercado Libre premium) */}
      <header className="sticky top-0 bg-navy text-pure-white shadow-md z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col py-3 md:flex-row md:items-center md:justify-between border-b border-navy-light/60">
            {/* Logo */}
            <div className="flex items-center justify-between mb-3 md:mb-0">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-pure-white to-emerald bg-clip-text text-transparent">
                  CLUB DE MARCAS
                </span>
                <span className="text-[10px] uppercase bg-emerald text-navy px-1.5 py-0.5 rounded font-black tracking-widest hidden sm:inline-block">
                  Premium
                </span>
              </Link>

              {/* Botones móviles rápidos */}
              <div className="flex items-center space-x-4 md:hidden">
                <Link href="/cart" className="relative p-1">
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald text-navy text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-navy">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Buscador predictivo masivo */}
            <div className="flex-1 md:mx-8 flex justify-center">
              <SearchBar products={allProducts} />
            </div>

            {/* Accesos de Cuenta y Carrito */}
            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-gray-400 truncate max-w-[150px]">
                      {user.email}
                    </span>
                    <span className="text-xs font-semibold text-emerald uppercase tracking-wider">
                      {profile?.role === 'admin' ? 'Administrador' : 'Club Socio'}
                    </span>
                  </div>

                  {profile?.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      title="Panel de Administración"
                      className="text-gray-300 hover:text-emerald p-2 rounded-full hover:bg-navy-light transition-colors"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                    </Link>
                  )}

                  <form action={signOutAction} className="inline m-0">
                    <button
                      type="submit"
                      title="Cerrar Sesión"
                      className="text-gray-300 hover:text-red-400 p-2 rounded-full hover:bg-navy-light transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-1.5 text-sm font-semibold hover:text-emerald transition-colors"
                >
                  <User className="w-5 h-5 text-gray-400" />
                  <span>Ingresar</span>
                </Link>
              )}

              {/* Botón Carrito */}
              <Link
                href="/cart"
                className="relative flex items-center space-x-2 text-sm font-semibold text-pure-white hover:text-emerald transition-all"
              >
                <div className="relative p-2 rounded-full bg-navy-light hover:bg-navy-light/80 transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-emerald text-navy text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-navy animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] text-gray-400">Mi carrito</span>
                  <span className="text-xs font-semibold">${cartItems.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0).toLocaleString('es-MX')}</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Menú de categorías secundario (Mercado Libre style) */}
          <nav className="flex items-center justify-between py-2.5 overflow-x-auto scrollbar-none">
            <div className="flex items-center space-x-6 text-sm font-medium text-gray-300 min-w-max">
              <Link href="/" className="hover:text-pure-white transition-colors">
                Inicio
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/?category=${cat.slug}`}
                  className="hover:text-pure-white transition-colors text-xs sm:text-sm"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-4 text-xs font-semibold text-emerald min-w-max ml-4 uppercase tracking-wider">
              <span>🇲🇽 Envíos a todo México gratis</span>
            </div>
          </nav>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-navy text-gray-400 py-12 mt-12 border-t border-navy-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="text-lg font-bold text-pure-white tracking-wider block mb-4">
                CLUB DE MARCAS
              </span>
              <p className="text-sm">
                La plataforma outlet premium número uno de México. Descuentos exclusivos del 30% al 70% en tus marcas de lujo favoritas.
              </p>
            </div>
            <div>
              <h4 className="text-pure-white font-semibold text-sm mb-4 uppercase tracking-wider">Categorías</h4>
              <ul className="space-y-2 text-sm">
                {categories.slice(0, 4).map(c => (
                  <li key={c.slug}>
                    <Link href={`/?category=${c.slug}`} className="hover:text-emerald transition-colors">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-pure-white font-semibold text-sm mb-4 uppercase tracking-wider">Seguridad</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2 text-emerald">
                  <span>🛡️ Pago 100% Seguro</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>📦 Envíos Asegurados DHL / FedEx</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>🔄 Devoluciones sin costo</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-pure-white font-semibold text-sm mb-4 uppercase tracking-wider">Contacto</h4>
              <p className="text-sm">
                ¿Necesitas ayuda?<br />
                Soporte 24/7 en WhatsApp:<br />
                <span className="text-emerald font-semibold">+52 (55) 1234-5678</span>
              </p>
            </div>
          </div>
          <div className="border-t border-navy-light/60 mt-8 pt-8 text-center text-xs">
            <p>&copy; {new Date().getFullYear()} Club de Marcas México. Todos los derechos reservados. Desarrollado con Next.js & Supabase.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
