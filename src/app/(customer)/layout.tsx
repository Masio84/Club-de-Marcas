import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, User, ShieldAlert, LogOut, LayoutDashboard, ShoppingBag, Wallet, Crown } from 'lucide-react'
import { DataService } from '@/utils/data-service'
import { signOutAction } from '@/app/actions'
import SearchBar from '@/components/SearchBar'
import CookieBanner from '@/components/CookieBanner'
import YieldChip from '@/components/YieldChip'
import NavbarBalance from '@/components/NavbarBalance'

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
    { name: 'Ropa', slug: 'Ropa' },
    { name: 'Calzado', slug: 'Calzado' },
  ]

  const dbConfigured = isSupabaseConfigured()

  return (
    <div className="flex flex-col min-h-screen bg-bg-base text-text-primary">
      {/* AVISO DE CONFIGURACIÓN DE BASE DE DATOS (MOCK MODE) */}
      {!dbConfigured && process.env.NODE_ENV !== 'production' && process.env.VERCEL_ENV !== 'production' && (
        <div className="bg-bg-surface border-b border-border-hairline text-accent-signature py-2 px-4 text-xs font-mono text-center flex items-center justify-center space-x-2 z-50">
          <ShieldAlert className="w-4 h-4 animate-pulse flex-shrink-0" />
          <span>
            MODO SIMULACIÓN ACTIVO · ALMACENAMIENTO LOCAL POR COOKIES
          </span>
        </div>
      )}

      {/* NAVBAR PRINCIPAL */}
      <header className="sticky top-0 bg-bg-surface border-b border-border-hairline z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col py-3 md:flex-row md:items-center md:justify-between border-b border-border-hairline/40">
            {/* Logo */}
            <div className="flex items-center justify-between mb-3 md:mb-0">
              <Link href="/" className="flex items-center group">
                <img
                  src="/Logo2_ClubdeMarcas.png"
                  alt="Club de Marcas"
                  className="h-8 md:h-10 w-auto object-contain flex-shrink-0"
                />
              </Link>


              {/* Botones móviles rápidos */}
              <div className="flex items-center space-x-4 md:hidden">
                <Link href="/cart" className="relative p-1">
                  <ShoppingCart className="w-6 h-6 text-text-primary" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-acceso text-bg-base text-[9px] font-mono font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Buscador predictivo */}
            <div className="flex-1 md:mx-8 flex justify-center">
              <SearchBar products={allProducts} />
            </div>

            {/* Accesos de Cuenta y Carrito */}
            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/profile"
                    title="Ver mi perfil de socio"
                    className="flex items-center space-x-3 group text-text-secondary hover:text-text-primary transition-all"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-border-hairline bg-bg-base flex items-center justify-center flex-shrink-0 group-hover:border-accent-signature transition-colors">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || user.email || 'Avatar'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-text-secondary" />
                      )}
                    </div>
                    <div className="flex flex-col text-left leading-tight">
                      <span className="text-xs text-text-primary font-medium truncate max-w-[120px] group-hover:text-text-primary transition-colors">
                        {profile?.full_name || user.email}
                      </span>
                      <span className={`text-[9px] font-bold font-mono uppercase tracking-wider mt-0.5 ${
                        profile?.membership_tier === 'premium' 
                          ? 'text-accent-signature' 
                          : profile?.membership_tier === 'basic' 
                            ? 'text-accent-acceso' 
                            : 'text-text-secondary'
                      }`}>
                        {profile?.role === 'admin' 
                          ? 'ADMINISTRADOR' 
                          : profile?.membership_tier === 'premium' 
                            ? 'SOCIO SIGNATURE' 
                            : profile?.membership_tier === 'basic' 
                              ? 'SOCIO ACCESO' 
                              : 'SOCIO STANDARD'}
                      </span>
                    </div>
                  </Link>

                  {profile?.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      title="Panel de Administración"
                      className="text-text-secondary hover:text-text-primary p-2 rounded-full hover:bg-bg-base transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                    </Link>
                  )}

                  <form action={signOutAction} className="inline m-0">
                    <button
                      type="submit"
                      title="Cerrar Sesión"
                      className="text-text-secondary hover:text-accent-alert p-2 rounded-full hover:bg-bg-base transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors"
                >
                  <User className="w-4 h-4 text-text-secondary" />
                  <span>Ingresar</span>
                </Link>
              )}

              {/* Botón Saldo Club */}
              {user && (
                <Link
                  href="/vault"
                  title="Ver mi Saldo Club"
                  className="flex items-center space-x-2 text-sm font-semibold text-text-primary hover:text-text-primary transition-all"
                >
                  <div className="relative p-2 rounded-full bg-bg-base border border-border-hairline text-accent-acceso">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Saldo Club</span>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <NavbarBalance initialBalance={profile?.reward_balance || 0} />
                      {profile?.membership_tier && (
                        <YieldChip rate={profile.membership_tier === 'premium' ? 12.0 : 2.0} tier={profile.membership_tier} />
                      )}
                    </div>
                  </div>
                </Link>
              )}

              {/* Botón Carrito */}
              <Link
                href="/cart"
                className="relative flex items-center space-x-2 text-sm font-semibold text-text-primary hover:text-text-primary transition-all"
              >
                <div className="relative p-2 rounded-full bg-bg-base border border-border-hairline">
                  <ShoppingCart className="w-4 h-4 text-text-secondary" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-accent-acceso text-bg-base text-[9px] font-mono font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Mi carrito</span>
                  <span className="text-xs font-mono font-bold text-text-primary mt-0.5">
                    ${cartItems.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0).toLocaleString('es-MX')}
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Menú de categorías secundario */}
          <nav className="flex items-center justify-between py-2.5 overflow-x-auto scrollbar-none">
            <div className="flex items-center space-x-6 text-[15px] font-bold uppercase tracking-[0.02em] text-text-secondary min-w-max">
              <Link href="/" className="hover:text-text-primary transition-colors">
                Inicio
              </Link>
              <Link href="/memberships" className="hover:text-accent-signature transition-colors flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-accent-signature" />
                <span>Membresías</span>
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/?category=${cat.slug}`}
                  className="hover:text-text-primary transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-4 text-[10px] font-mono text-accent-acceso min-w-max ml-4 uppercase tracking-wider">
              <span>🇲🇽 Envíos gratis en Aguascalientes</span>
            </div>
          </nav>
        </div>
      </header>

      {/* TICKER DE ACTIVIDAD DE SOCIOS - INHABILITADO HASTA TENER CONTRATOS REGULATORIOS */}
      {false && (
        <div className="relative w-full overflow-hidden bg-text-primary border-b border-border-hairline py-3 text-[13px] text-bg-base select-none z-30 shadow-inner">
          <style>{`
            @keyframes ticker {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
            .animate-ticker {
              display: inline-flex;
              white-space: nowrap;
              animation: ticker 45s linear infinite;
            }
            .animate-ticker:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="animate-ticker font-mono space-x-12 uppercase tracking-wider flex items-center">
            <span>• 🇲🇽 ENVÍOS EXPRESS GRATIS EN COMPRAS MAYORES A $1,500 MXN EN AGUASCALIENTES</span>
            <span>• 💎 GARANTÍA DE AUTENTICIDAD: PRODUCTOS 100% ORIGINALES DE DISEÑADOR</span>
            <span>• 🛍️ SOFÍA T. ADQUIRIÓ BOLSA <strong className="text-accent-signature font-bold">COACH NEW YORK</strong> CON -40% OUTLET · HACE 4 MIN</span>
            <span>• 👑 CONVIÉRTETE EN SOCIO SIGNATURE Y LOGRA HASTA <strong className="text-accent-signature font-bold">17% DE CASHBACK</strong> EN CADA COMPRA</span>
            <span>• ⏱️ HÉCTOR M. AHORRÓ <strong className="text-accent-acceso">$2,450.00</strong> EN RELOJ SEIKO AUTOMÁTICO · HACE 10 MIN</span>
            <span>• 🕶️ LENTES RAY-BAN CON HASTA -30% DE DESCUENTO MÁS ACUMULACIÓN DE SALDO CLUB</span>
            <span>• 👟 ADRIANA L. OBTUVO <strong className="text-accent-acceso">$450.00</strong> DE CASHBACK EN TENIS ADIDAS PREMIUM · HACE 15 MIN</span>
            
            {/* Duplicado para loop infinito fluido */}
            <span>• 🇲🇽 ENVÍOS EXPRESS GRATIS EN COMPRAS MAYORES A $1,500 MXN EN AGUASCALIENTES</span>
            <span>• 💎 GARANTÍA DE AUTENTICIDAD: PRODUCTOS 100% ORIGINALES DE DISEÑADOR</span>
            <span>• 🛍️ SOFÍA T. ADQUIRIÓ BOLSA <strong className="text-accent-signature font-bold">COACH NEW YORK</strong> CON -40% OUTLET · HACE 4 MIN</span>
            <span>• 👑 CONVIÉRTETE EN SOCIO SIGNATURE Y LOGRA HASTA <strong className="text-accent-signature font-bold">17% DE CASHBACK</strong> EN CADA COMPRA</span>
            <span>• ⏱️ HÉCTOR M. AHORRÓ <strong className="text-accent-acceso">$2,450.00</strong> EN RELOJ SEIKO AUTOMÁTICO · HACE 10 MIN</span>
            <span>• 🕶️ LENTES RAY-BAN CON HASTA -30% DE DESCUENTO MÁS ACUMULACIÓN DE SALDO CLUB</span>
            <span>• 👟 ADRIANA L. OBTUVO <strong className="text-accent-acceso">$450.00</strong> DE CASHBACK EN TENIS ADIDAS PREMIUM · HACE 15 MIN</span>
          </div>
        </div>
      )}

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
                <li className="flex items-center space-x-2">
                  <span>📦 Envíos Asegurados</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-pure-white font-semibold text-sm mb-4 uppercase tracking-wider">Contacto</h4>
              <p className="text-sm">
                ¿Necesitas ayuda?<br />
                Soporte 24/7 en WhatsApp:<br />
                <span className="text-emerald font-semibold">+52 449 110 9178</span>
              </p>
            </div>
          </div>
          <div className="border-t border-navy-light/60 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} Personal Rikdom S.A.P.I. de C.V. Todos los derechos reservados.</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link href="/terminos-y-condiciones" className="hover:text-emerald transition-colors font-medium">Términos y Condiciones</Link>
              <Link href="/aviso-de-privacidad" className="hover:text-emerald transition-colors font-medium">Aviso de Privacidad</Link>
              <Link href="/envios-y-devoluciones" className="hover:text-emerald transition-colors font-medium">Envíos y Devoluciones</Link>
            </div>
          </div>
        </div>
      </footer>
      <CookieBanner />
    </div>
  )
}
