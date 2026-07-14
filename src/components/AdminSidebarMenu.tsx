'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  ClipboardList,
  Settings
} from 'lucide-react'

export default function AdminSidebarMenu() {
  const pathname = usePathname()

  const menuItems = [
    { name: 'Métricas', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Productos', href: '/admin/products', icon: ShoppingBag },
    { name: 'Carrusel', href: '/admin/carousel', icon: ClipboardList },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Pedidos', href: '/admin/orders', icon: ClipboardList },
    { name: 'Ajustes', href: '/admin/settings', icon: Settings },
  ]

  return (
    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto font-sans">
      {menuItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ease-out hover:translate-x-1 ${
              isActive
                ? 'text-[#0EA372] bg-[#1E2530] font-bold border border-[#0EA372]/10 shadow-[0_2px_10px_rgba(14,163,114,0.06)]'
                : 'text-gray-400 hover:bg-[#1E2530]/50 hover:text-white font-medium'
            }`}
          >
            {/* Barra lateral indicadora de activo */}
            {isActive && (
              <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#0EA372] rounded-r-md" />
            )}

            <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${
              isActive ? 'text-[#0EA372]' : 'text-gray-400 group-hover:text-white'
            }`} />
            <span className="transition-colors duration-200">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
