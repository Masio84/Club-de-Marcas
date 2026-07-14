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
import AdminSidebarMenu from '@/components/AdminSidebarMenu'

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

  // Si está configurada la base de datos y no es administrador o superadministrador, denegar acceso
  if (dbConfigured && (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin') || profile.is_banned)) {
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
    <div className="flex h-screen bg-bg-base overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="hidden md:flex md:flex-col md:w-56 bg-bg-dark-panel text-gray-100 flex-shrink-0 border-r border-neutral-850">
        {/* Cabecera Sidebar */}
        <div className="p-6 flex items-center justify-center border-b border-neutral-850 min-h-[64px]">
          <div className="bg-bg-surface p-1.5 rounded-lg flex items-center justify-center h-8 w-36 flex-shrink-0">
            <img
              src="/Logo2_ClubdeMarcas.png"
              alt="Club de Marcas"
              className="h-full max-w-full object-contain"
            />
          </div>
        </div>

        {/* Enlaces de Navegación (Client Menu) */}
        <AdminSidebarMenu />

        {/* Footer de Sidebar */}
        <div className="p-4 border-t border-neutral-850 bg-bg-dark-panel space-y-3">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 truncate max-w-[200px]" title={user?.email || ''}>
              {user?.email}
            </span>
            <span className="text-[10px] text-[#0EA372] font-mono font-bold uppercase tracking-wider">
              {profile?.role === 'admin' ? 'Administrador' : 'Mock Admin'}
            </span>
          </div>

          <div className="pt-2 border-t border-neutral-850/45 flex flex-col space-y-2">
            <Link
              href="/"
              className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:bg-[#1E2530]/40 hover:text-white transition-colors"
            >
              <Store className="w-4 h-4 text-current" />
              <span>Volver a la tienda</span>
            </Link>

            <form action={signOutAction} className="m-0">
              <button
                type="submit"
                className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-450 hover:bg-red-950/20 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4 text-current" />
                <span>Cerrar Sesión</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cabecera del Panel */}
        <header className="bg-bg-surface border-b border-border-hairline h-16 flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center space-x-4">
            <button className="md:hidden text-text-primary hover:text-accent-acceso">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-display font-semibold text-text-primary uppercase tracking-wider">
              Panel de Control
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {!dbConfigured && (
              <span className="bg-[#F0E4CF] border border-accent-signature/20 text-accent-signature text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Simulación Activa</span>
              </span>
            )}
            <div className="flex items-center space-x-2 text-xs font-bold text-text-primary bg-bg-base px-3 py-1.5 rounded-lg border border-border-hairline">
              <ShieldCheck className="w-4 h-4 text-accent-acceso" />
              <span>Estatus Seguro</span>
            </div>
          </div>
        </header>

        {/* Área del Dashboard */}
        <main className="flex-1 overflow-y-auto p-6 bg-bg-base">
          {children}
        </main>
      </div>
    </div>
  )
}
