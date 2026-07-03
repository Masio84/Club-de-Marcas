import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  ClipboardList,
  Store,
  LogOut,
  ShieldCheck,
  Menu,
  ShieldAlert,
  Settings
} from 'lucide-react'
import { DataService } from '@/utils/data-service'
import { signOutAction } from '@/app/actions'

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!url && url !== '' && url !== 'https://placeholder.supabase.co'
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Comprobación de seguridad en el servidor
  const user = await DataService.getCurrentUser()
  const profile = await DataService.getCurrentUserProfile()
  const dbConfigured = isSupabaseConfigured()

  // Si está configurada la base de datos y no es administrador, denegar acceso
  if (dbConfigured && (!profile || profile.role !== 'admin' || profile.is_banned)) {
    redirect('/')
  }

  // En modo simulación, si no hay usuario mock, redirigir al login
  if (!dbConfigured && !user) {
    redirect('/login?redirectTo=/admin/dashboard')
  }

  const menuItems = [
    { name: 'Métricas', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Productos', href: '/admin/products', icon: ShoppingBag },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Pedidos', href: '/admin/orders', icon: ClipboardList },
    { name: 'Ajustes', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-light-grey overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-navy text-pure-white flex-shrink-0 border-r border-navy-light/60">
        {/* Cabecera Sidebar */}
        <div className="p-6 flex items-center justify-between border-b border-navy-light/60">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-black tracking-widest text-pure-white bg-emerald text-navy px-2 py-0.5 rounded">
              ADMIN
            </span>
            <span className="font-bold text-sm text-gray-200">Club de Marcas</span>
          </div>
        </div>

        {/* Enlaces de Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-300 hover:bg-navy-light hover:text-pure-white transition-colors"
              >
                <Icon className="w-5 h-5 text-gray-400" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer de Sidebar */}
        <div className="p-4 border-t border-navy-light/60 bg-navy-light/20 space-y-3">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 truncate max-w-[200px]" title={user?.email || ''}>
              {user?.email}
            </span>
            <span className="text-[10px] text-emerald font-bold uppercase tracking-wider">
              {profile?.role === 'admin' ? 'Administrador' : 'Mock Admin'}
            </span>
          </div>

          <div className="pt-2 border-t border-navy-light/40 flex flex-col space-y-2">
            <Link
              href="/"
              className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-300 hover:bg-navy-light hover:text-emerald transition-colors"
            >
              <Store className="w-4 h-4" />
              <span>Volver a la tienda</span>
            </Link>

            <form action={signOutAction} className="m-0">
              <button
                type="submit"
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-950/20 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cabecera del Panel */}
        <header className="bg-pure-white border-b border-gray-200 h-16 flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center space-x-4">
            <button className="md:hidden text-navy hover:text-emerald">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-black text-navy uppercase tracking-wider">
              Panel de Control
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {!dbConfigured && (
              <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Simulación Activa</span>
              </span>
            )}
            <div className="flex items-center space-x-2 text-xs font-bold text-navy bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
              <ShieldCheck className="w-4 h-4 text-emerald" />
              <span>Estatus Seguro</span>
            </div>
          </div>
        </header>

        {/* Área del Dashboard */}
        <main className="flex-1 overflow-y-auto p-6 bg-light-grey">
          {children}
        </main>
      </div>
    </div>
  )
}
