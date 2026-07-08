import React from 'react'
import Link from 'next/link'
import { DollarSign, ShoppingBag, Users, AlertTriangle, ArrowRight, ClipboardList } from 'lucide-react'
import { DataService } from '@/utils/data-service'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  // Obtener datos consolidados
  const products = await DataService.getProducts()
  const profiles = await DataService.getProfiles()
  const orders = await DataService.getOrders()

  // Calcular métricas
  const totalSales = orders.reduce((acc, o) => acc + o.total, 0)
  const clientProfiles = profiles.filter(p => p.role === 'client')
  const productsCount = products.length
  const lowStockCount = products.filter(p => p.inventory <= 5).length

  // Obtener los últimos 5 pedidos
  const recentOrders = orders.slice(0, 5)

  // Tarjetas de estadísticas
  const stats = [
    {
      name: 'Ventas Totales',
      value: `$${totalSales.toLocaleString('es-MX')}`,
      icon: DollarSign,
      color: 'text-text-secondary bg-bg-base border-border-hairline',
      description: 'Acumulado histórico'
    },
    {
      name: 'Clientes Socios',
      value: clientProfiles.length.toString(),
      icon: Users,
      color: 'text-text-secondary bg-bg-base border-border-hairline',
      description: 'Usuarios en el club'
    },
    {
      name: 'Productos Activos',
      value: productsCount.toString(),
      icon: ShoppingBag,
      color: 'text-text-secondary bg-bg-base border-border-hairline',
      description: 'Catálogo disponible'
    },
    {
      name: 'Inventario Bajo',
      value: lowStockCount.toString(),
      icon: AlertTriangle,
      color: lowStockCount > 0 ? 'text-[#C93B31] bg-red-50 border-[#C93B31]/20 animate-pulse' : 'text-text-secondary bg-bg-base border-border-hairline',
      description: 'Stock menor a 5'
    }
  ]

  return (
    <div className="space-y-8 font-sans">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-display font-semibold text-text-primary">Métricas Generales</h2>
        <p className="text-xs text-text-secondary mt-1">Resumen del estado y ventas de Club de Marcas.</p>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="bg-bg-surface p-6 rounded-2xl border border-border-hairline flex items-start justify-between space-x-4 shadow-sm"
            >
              <div className="space-y-2">
                <p 
                  className="text-[13px] tracking-wider text-text-secondary uppercase"
                  style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace' }}
                >
                  {stat.name}
                </p>
                <h3 
                  className="text-3xl font-bold text-text-primary tracking-tight"
                  style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace' }}
                >
                  {stat.value}
                </h3>
                <p className="text-[11px] text-text-secondary font-medium">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-xl border ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Grid Secundario: Pedidos Recientes e Inventario Crítico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabla Pedidos Recientes */}
        <div className="lg:col-span-2 bg-bg-surface p-6 rounded-2xl border border-border-hairline shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border-hairline pb-3">
            <h3 className="font-display font-semibold text-text-primary text-sm uppercase tracking-wider flex items-center space-x-2">
              <ClipboardList className="w-4 h-4 text-text-secondary" />
              <span>Pedidos Recientes</span>
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-text-primary hover:text-accent-acceso flex items-center space-x-1 transition-colors"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-text-secondary text-xs py-8 text-center">No hay pedidos registrados en el sistema.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-text-secondary border-b border-border-hairline uppercase font-mono tracking-wider">
                    <th className="pb-3 font-semibold">ID Pedido</th>
                    <th className="pb-3 font-semibold">Cliente</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Estatus</th>
                    <th className="pb-3 text-right font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-hairline/60">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-bg-base/45 transition-colors">
                      <td className="py-3.5 font-mono text-text-primary truncate max-w-[80px]" title={order.id}>
                        #{order.id.slice(4).toUpperCase()}
                      </td>
                      <td className="py-3.5 text-text-secondary font-medium">{order.customer_email}</td>
                      <td className="py-3.5 font-bold font-mono text-text-primary">
                        ${order.total.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          order.status === 'completed'
                            ? 'bg-accent-acceso-tint text-accent-acceso border border-accent-acceso/20'
                            : order.status === 'shipped'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'bg-accent-signature-tint text-accent-signature border border-accent-signature/20'
                        }`}>
                          {order.status === 'completed' ? 'Completado' : order.status === 'shipped' ? 'Enviado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right text-text-secondary font-mono">
                        {new Date(order.created_at).toLocaleDateString('es-MX')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lista de Stock Crítico */}
        <div className="bg-bg-surface p-6 rounded-2xl border border-border-hairline shadow-sm space-y-4">
          <h3 className="font-display font-semibold text-text-primary text-sm uppercase tracking-wider flex items-center space-x-2 border-b border-border-hairline pb-3">
            <AlertTriangle className="w-4 h-4 text-[#C93B31]" />
            <span>Stock Crítico</span>
          </h3>

          <div className="divide-y divide-border-hairline/60">
            {products.filter(p => p.inventory <= 5).length === 0 ? (
              <p className="text-text-secondary text-xs py-8 text-center">Todo el inventario está en niveles óptimos.</p>
            ) : (
              products.filter(p => p.inventory <= 5).slice(0, 5).map((prod) => (
                <div key={prod.id} className="py-3.5 flex items-center justify-between space-x-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary text-xs truncate max-w-[150px]">{prod.title}</p>
                    <p className="text-[10px] text-text-secondary font-mono mt-0.5 uppercase">{prod.category}</p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    prod.inventory === 0
                      ? 'bg-red-50 text-[#C93B31] border border-[#C93B31]/20'
                      : 'bg-accent-signature-tint text-accent-signature border border-accent-signature/20'
                  }`}>
                    {prod.inventory === 0 ? 'SIN STOCK' : `${prod.inventory} PZAS`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
