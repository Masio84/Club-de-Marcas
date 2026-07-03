import React from 'react'
import Link from 'next/link'
import { DollarSign, ShoppingBag, Users, AlertTriangle, ArrowRight, ClipboardList } from 'lucide-react'
import { DataService } from '@/utils/data-service'

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
      value: `$${totalSales.toLocaleString('es-MX')} MXN`,
      icon: DollarSign,
      color: 'text-emerald bg-emerald/10 border-emerald/20',
      description: 'Acumulado histórico de pedidos'
    },
    {
      name: 'Clientes Socios',
      value: clientProfiles.length.toString(),
      icon: Users,
      color: 'text-blue-500 bg-blue-50 border-blue-100',
      description: 'Usuarios registrados en el club'
    },
    {
      name: 'Productos Activos',
      value: productsCount.toString(),
      icon: ShoppingBag,
      color: 'text-purple-500 bg-purple-50 border-purple-100',
      description: 'Artículos en el catálogo outlet'
    },
    {
      name: 'Inventario Bajo',
      value: lowStockCount.toString(),
      icon: AlertTriangle,
      color: lowStockCount > 0 ? 'text-red-500 bg-red-50 border-red-100 animate-pulse' : 'text-gray-400 bg-gray-50 border-gray-150',
      description: 'Productos con stock menor o igual a 5'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-navy">Métricas Generales</h2>
        <p className="text-xs text-gray-500">Resumen del estado y ventas de Club de Marcas en México.</p>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="bg-pure-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start justify-between space-x-4"
            >
              <div className="space-y-2">
                <p className="text-xs font-black text-navy uppercase tracking-wider">{stat.name}</p>
                <h3 className="text-2xl font-black text-navy">{stat.value}</h3>
                <p className="text-[11px] text-gray-400 font-medium">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-xl border ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Grid Secundario: Pedidos Recientes e Inventario Crítico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabla Pedidos Recientes */}
        <div className="lg:col-span-2 bg-pure-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-navy text-sm uppercase tracking-wider flex items-center space-x-2">
              <ClipboardList className="w-4.5 h-4.5 text-gray-400" />
              <span>Pedidos Recientes</span>
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-navy hover:text-emerald flex items-center space-x-1 transition-colors"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-xs py-8 text-center">No hay pedidos registrados en el sistema.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100 uppercase font-black tracking-wider">
                    <th className="pb-3">ID Pedido</th>
                    <th className="pb-3">Cliente</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Estatus</th>
                    <th className="pb-3 text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 font-semibold text-navy truncate max-w-[80px]" title={order.id}>
                        {order.id.slice(4)}
                      </td>
                      <td className="py-3.5 text-gray-500 font-medium">{order.customer_email}</td>
                      <td className="py-3.5 font-bold text-navy">
                        ${order.total.toLocaleString('es-MX')} MXN
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status === 'completed' ? 'Completado' : order.status === 'shipped' ? 'Enviado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right text-gray-400 font-medium">
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
        <div className="bg-pure-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-navy text-sm uppercase tracking-wider flex items-center space-x-2 border-b border-gray-100 pb-3">
            <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
            <span>Stock Crítico</span>
          </h3>

          <div className="divide-y divide-gray-100">
            {products.filter(p => p.inventory <= 5).length === 0 ? (
              <p className="text-gray-400 text-xs py-8 text-center">Todo el inventario está en niveles óptimos.</p>
            ) : (
              products.filter(p => p.inventory <= 5).slice(0, 5).map((prod) => (
                <div key={prod.id} className="py-3.5 flex items-center justify-between space-x-3">
                  <div className="min-w-0">
                    <p className="font-bold text-navy text-xs truncate max-w-[150px]">{prod.title}</p>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">{prod.category}</p>
                  </div>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                    prod.inventory === 0
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {prod.inventory === 0 ? 'Sin Stock' : `${prod.inventory} disp.`}
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
