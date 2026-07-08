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
  pending: { label: 'Pendiente', icon: Clock, color: 'bg-accent-signature-tint text-accent-signature border border-accent-signature/20', border: 'border-accent-signature/20' },
  shipped: { label: 'Enviado', icon: Truck, color: 'bg-blue-50 text-blue-600 border border-blue-200', border: 'border-blue-200' },
  completed: { label: 'Completado', icon: CheckCircle2, color: 'bg-accent-acceso-tint text-accent-acceso border border-accent-acceso/20', border: 'border-accent-acceso/20' },
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
    <div className="space-y-6 font-sans">
      <div className="border-b border-border-hairline pb-4">
        <h2 className="text-2xl font-display font-semibold text-text-primary">Gestión de Pedidos</h2>
        <p className="text-xs text-text-secondary mt-1">Monitorea y actualiza el estado de cada pedido procesado.</p>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-bg-surface p-4 rounded-xl border border-border-hairline shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-accent-signature-tint text-accent-signature border border-accent-signature/20"><Clock className="w-5 h-5" /></div>
          <div><p className="text-[10px] text-text-secondary uppercase font-bold">Pendientes</p><p className="text-lg font-bold font-mono text-text-primary">{pendingCount}</p></div>
        </div>
        <div className="bg-bg-surface p-4 rounded-xl border border-border-hairline shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200"><Truck className="w-5 h-5" /></div>
          <div><p className="text-[10px] text-text-secondary uppercase font-bold">Enviados</p><p className="text-lg font-bold font-mono text-text-primary">{shippedCount}</p></div>
        </div>
        <div className="bg-bg-surface p-4 rounded-xl border border-border-hairline shadow-sm flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-accent-acceso-tint text-accent-acceso border border-accent-acceso/20"><CheckCircle2 className="w-5 h-5" /></div>
          <div><p className="text-[10px] text-text-secondary uppercase font-bold">Completados</p><p className="text-lg font-bold font-mono text-text-primary">{completedCount}</p></div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-bg-surface p-12 rounded-2xl border border-border-hairline shadow-sm text-center">
            <Package className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary text-sm">No hay pedidos registrados aún.</p>
          </div>
        ) : (
          orders.map((order) => {
            const config = statusConfig[order.status]
            const StatusIcon = config.icon
            const isExpanded = expandedOrder === order.id

            return (
              <div key={order.id} className="bg-bg-surface rounded-2xl border border-border-hairline shadow-sm overflow-hidden">
                {/* Cabecera del pedido */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-bg-base/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg border ${config.color}`}>
                      <StatusIcon className="w-4 h-4 text-current" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-mono font-bold text-text-primary">Pedido #{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5 font-medium">{order.customer_email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-sm font-bold font-mono text-text-primary">
                      ${order.total.toLocaleString('es-MX')}
                    </span>
                    <span className="text-[10px] text-text-secondary font-mono hidden sm:block">
                      {new Date(order.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
                  </div>
                </button>

                {/* Detalles expandidos */}
                {isExpanded && (
                  <div className="border-t border-border-hairline p-5 space-y-5 bg-bg-base/20">
                    {/* Info del cliente */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <p className="text-[10px] font-mono tracking-wider text-text-secondary uppercase">Cliente</p>
                        <p className="text-xs font-semibold text-text-primary">{order.customer_email}</p>
                      </div>
                      <div className="space-y-1 text-left">
                        <p className="text-[10px] font-mono tracking-wider text-text-secondary uppercase">Dirección de Envío</p>
                        <p className="text-xs font-medium text-text-primary">{order.shipping_address}</p>
                      </div>
                    </div>

                    {/* Productos del pedido */}
                    {order.items && order.items.length > 0 && (
                      <div className="space-y-2 text-left">
                        <p className="text-[10px] font-mono tracking-wider text-text-secondary uppercase">Productos</p>
                        <div className="bg-bg-surface rounded-xl border border-border-hairline divide-y divide-border-hairline/60 overflow-hidden">
                          {order.items.map((item) => (
                            <div key={item.id} className="p-3 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {item.product?.image_url && (
                                  <img src={item.product.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                                )}
                                <div>
                                  <p className="text-xs font-semibold text-text-primary">{item.product?.title || 'Producto eliminado'}</p>
                                  <p className="text-[10px] text-text-secondary font-mono mt-0.5">Cant: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="text-xs font-bold font-mono text-text-primary">${(item.price * item.quantity).toLocaleString('es-MX')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Selector de estado */}
                    <div className="flex items-center justify-between border-t border-border-hairline pt-4">
                      <p className="text-[10px] font-mono tracking-wider text-text-secondary uppercase">Cambiar Estado</p>
                      <div className="flex items-center space-x-2">
                        {(['pending', 'shipped', 'completed'] as const).map((st) => {
                          const stConfig = statusConfig[st]
                          const isActive = order.status === st
                          return (
                            <button
                              key={st}
                              onClick={() => handleStatusChange(order.id, st)}
                              disabled={isPending || isActive}
                              className={`text-[10px] font-mono font-bold py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                                isActive
                                  ? `${stConfig.color} ring-2 ring-offset-1 ring-accent-acceso/30`
                                  : 'bg-bg-base text-text-secondary border-border-hairline hover:bg-border-hairline/50'
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
