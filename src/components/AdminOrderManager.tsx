'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Package, Truck, CheckCircle2, Clock } from 'lucide-react'
import { Order } from '@/utils/data-service'
import { updateOrderStatusAction } from '@/app/actions'

interface AdminOrderManagerProps {
  orders: Order[]
}

const statusConfig = {
  pending: { label: 'Pendiente', icon: Clock, color: 'bg-amber-100 text-amber-800', border: 'border-amber-200' },
  shipped: { label: 'Enviado', icon: Truck, color: 'bg-blue-100 text-blue-800', border: 'border-blue-200' },
  completed: { label: 'Completado', icon: CheckCircle2, color: 'bg-green-100 text-green-800', border: 'border-green-200' },
}

export default function AdminOrderManager({ orders }: AdminOrderManagerProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleStatusChange = (orderId: string, newStatus: 'pending' | 'shipped' | 'completed') => {
    startTransition(async () => {
      await updateOrderStatusAction(orderId, newStatus)
      router.refresh()
    })
  }

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  // Conteos por estado
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const shippedCount = orders.filter(o => o.status === 'shipped').length
  const completedCount = orders.filter(o => o.status === 'completed').length

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-navy">Gestión de Pedidos</h2>
        <p className="text-xs text-gray-500">Monitorea y actualiza el estado de cada pedido procesado.</p>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-pure-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800"><Clock className="w-5 h-5" /></div>
          <div><p className="text-[10px] text-gray-400 uppercase font-bold">Pendientes</p><p className="text-lg font-black text-navy">{pendingCount}</p></div>
        </div>
        <div className="bg-pure-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-100 text-blue-800"><Truck className="w-5 h-5" /></div>
          <div><p className="text-[10px] text-gray-400 uppercase font-bold">Enviados</p><p className="text-lg font-black text-navy">{shippedCount}</p></div>
        </div>
        <div className="bg-pure-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-green-100 text-green-800"><CheckCircle2 className="w-5 h-5" /></div>
          <div><p className="text-[10px] text-gray-400 uppercase font-bold">Completados</p><p className="text-lg font-black text-navy">{completedCount}</p></div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-pure-white p-12 rounded-2xl border border-gray-200 shadow-sm text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">No hay pedidos registrados aún.</p>
          </div>
        ) : (
          orders.map((order) => {
            const config = statusConfig[order.status]
            const StatusIcon = config.icon
            const isExpanded = expandedOrder === order.id

            return (
              <div key={order.id} className="bg-pure-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Cabecera del pedido */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-navy">Pedido #{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{order.customer_email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-sm font-black text-navy">
                      ${order.total.toLocaleString('es-MX')} MXN
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium hidden sm:block">
                      {new Date(order.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {/* Detalles expandidos */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 space-y-5 bg-gray-50/30">
                    {/* Info del cliente */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Cliente</p>
                        <p className="text-xs font-semibold text-navy">{order.customer_email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Dirección de Envío</p>
                        <p className="text-xs font-medium text-navy">{order.shipping_address}</p>
                      </div>
                    </div>

                    {/* Productos del pedido */}
                    {order.items && order.items.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Productos</p>
                        <div className="bg-pure-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                          {order.items.map((item) => (
                            <div key={item.id} className="p-3 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {item.product?.image_url && (
                                  <img src={item.product.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                                )}
                                <div>
                                  <p className="text-xs font-bold text-navy">{item.product?.title || 'Producto eliminado'}</p>
                                  <p className="text-[10px] text-gray-400">Cant: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="text-xs font-black text-navy">${(item.price * item.quantity).toLocaleString('es-MX')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Selector de estado */}
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Cambiar Estado</p>
                      <div className="flex items-center space-x-2">
                        {(['pending', 'shipped', 'completed'] as const).map((st) => {
                          const stConfig = statusConfig[st]
                          const isActive = order.status === st
                          return (
                            <button
                              key={st}
                              onClick={() => handleStatusChange(order.id, st)}
                              disabled={isPending || isActive}
                              className={`text-[10px] font-bold py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                                isActive
                                  ? `${stConfig.color} ${stConfig.border} ring-2 ring-offset-1 ring-gray-300`
                                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {stConfig.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
