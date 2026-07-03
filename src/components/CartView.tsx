'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, Truck, ChevronRight } from 'lucide-react'
import { CartItem } from '@/utils/data-service'
import { updateCartItemAction, removeFromCartAction, createOrderAction } from '@/app/actions'

interface CartViewProps {
  initialItems: CartItem[]
  userEmail: string
}

export default function CartView({ initialItems, userEmail }: CartViewProps) {
  const [items, setItems] = useState<CartItem[]>(initialItems)
  const [shippingAddress, setShippingAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const subtotal = items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0)
  const shipping = 0 // Envíos gratis en Club de Marcas
  const total = subtotal + shipping

  // Actualizar cantidad de un elemento
  const handleQuantityChange = async (itemId: string, currentQty: number, change: number, maxStock: number) => {
    const newQty = currentQty + change
    if (newQty < 1 || newQty > maxStock || loading) return

    // Actualizar estado local inmediatamente para micro-animación fluida
    const updatedItems = items.map(item => 
      item.id === itemId ? { ...item, quantity: newQty } : item
    )
    setItems(updatedItems)

    try {
      const res = await updateCartItemAction(itemId, newQty)
      if (!res.success) {
        // Si falla en el servidor, revertimos
        setItems(items)
        alert('No se pudo actualizar la cantidad.')
      } else {
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      setItems(items)
    }
  }

  // Eliminar elemento del carrito
  const handleRemoveItem = async (itemId: string) => {
    if (loading) return
    const originalItems = [...items]
    const filtered = items.filter(item => item.id !== itemId)
    setItems(filtered)

    try {
      const res = await removeFromCartAction(itemId)
      if (!res.success) {
        setItems(originalItems)
        alert('No se pudo eliminar el artículo.')
      } else {
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      setItems(originalItems)
    }
  }

  // Procesar compra (Checkout)
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shippingAddress.trim() || items.length === 0 || loading) return

    setLoading(true)
    setError('')
    try {
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || 0
      }))

      const res = await createOrderAction(shippingAddress.trim(), total, orderItems)
      if (res.success) {
        setSuccess(true)
        setItems([])
        router.refresh()
      } else {
        setError(res.error || 'Hubo un error al procesar tu compra.')
      }
    } catch (err) {
      console.error(err)
      setError('Ocurrió un error inesperado al procesar el pedido.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-pure-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-sm text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 bg-emerald/20 text-emerald rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-navy">¡Compra Realizada con Éxito!</h2>
          <p className="text-gray-500 text-sm">
            Hemos registrado tu pedido. Te enviaremos un correo de confirmación a <b>{userEmail}</b> con los detalles de rastreo de tu paquete.
          </p>
        </div>
        <div className="border-t border-gray-100 pt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-emerald hover:bg-emerald-hover text-navy font-bold px-6 py-3 rounded-lg text-sm transition-colors w-full"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-pure-white p-12 rounded-2xl border border-gray-200 shadow-sm text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-navy">Tu carrito está vacío</h2>
          <p className="text-gray-400 text-sm">Agrega productos premium para comenzar tu compra.</p>
        </div>
        <Link
          href="/"
          className="inline-block bg-navy hover:bg-navy-light text-pure-white font-bold px-6 py-3 rounded-lg text-sm transition-colors"
        >
          Explorar catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Lista de productos en el carrito */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-lg font-black text-navy uppercase tracking-wider mb-2">Mi Carrito ({items.length})</h2>
        
        <div className="bg-pure-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
          {items.map((item) => (
            <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <img
                  src={item.product?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop'}
                  alt={item.product?.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {item.product?.category}
                  </span>
                  <h3 className="font-bold text-navy text-sm sm:text-base truncate max-w-[200px] sm:max-w-[300px]">
                    {item.product?.title}
                  </h3>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-sm font-black text-navy">
                      ${item.product?.price.toLocaleString('es-MX')} MXN
                    </span>
                    {item.product?.original_price && (
                      <span className="text-xs text-gray-400 line-through">
                        ${item.product?.original_price.toLocaleString('es-MX')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Controles de cantidad y eliminación */}
              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-none pt-3 sm:pt-0">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-55">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, item.quantity, -1, item.product?.inventory || 99)}
                    className="p-2 hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-navy select-none">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, item.quantity, 1, item.product?.inventory || 99)}
                    className="p-2 hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm sm:text-base font-black text-navy text-right min-w-[80px]">
                    ${((item.product?.price || 0) * item.quantity).toLocaleString('es-MX')}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                    title="Eliminar artículo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen de Compra y Checkout */}
      <div className="space-y-6">
        <h2 className="text-lg font-black text-navy uppercase tracking-wider mb-2">Resumen de Compra</h2>

        <div className="bg-pure-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="space-y-3 text-sm border-b border-gray-100 pb-4">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold text-navy">${subtotal.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Envío (DHL / FedEx)</span>
              <span className="font-semibold text-emerald uppercase text-xs">Gratis</span>
            </div>
            <div className="flex justify-between text-navy text-base font-black pt-2">
              <span>Total (MXN)</span>
              <span>${total.toLocaleString('es-MX')}</span>
            </div>
          </div>

          {/* Formulario de envío */}
          <form onSubmit={handleCheckout} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="address" className="text-xs font-black text-navy uppercase tracking-wider block">
                Dirección de Envío (México)
              </label>
              <textarea
                id="address"
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Calle, Número, Colonia, C.P., Municipio, Estado"
                rows={3}
                className="w-full text-sm bg-gray-50 text-navy placeholder-gray-400 p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>

            {error && (
              <div className="bg-red-55 border border-red-200 text-red-650 text-xs p-3 rounded-lg font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !shippingAddress.trim()}
              className="w-full bg-emerald hover:bg-emerald-hover disabled:bg-gray-200 text-navy font-bold py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01]"
            >
              <CreditCard className="w-5 h-5" />
              <span>{loading ? 'Procesando Pago...' : 'Finalizar Pedido y Pagar'}</span>
            </button>
          </form>

          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2.5 text-xs text-gray-500">
              <Truck className="w-4 h-4 text-emerald" />
              <span>Entrega estimada: 3 a 5 días hábiles</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-gray-500">
              <svg className="w-4 h-4 text-emerald" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.9L10 .954 17.834 4.9A1 1 0 0118.5 5.8v6c0 3.633-2.533 6.94-6 7.733l-2.5.57a1 1 0 01-.4 0l-2.5-.57c-3.467-.793-6-4.1-6-7.733v-6a1 1 0 01.666-.9zM10 10a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm0-3a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span>Protección al comprador de Club de Marcas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
