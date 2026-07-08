'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, Truck, ChevronRight, Coins, Lock, CheckCircle2, ShieldCheck, AlertCircle, Crown } from 'lucide-react'
import { CartItem, type Profile } from '@/utils/data-service'
import { updateCartItemAction, removeFromCartAction, createOrderAction } from '@/app/actions'

interface CartViewProps {
  initialItems: CartItem[]
  userEmail: string
  profile: Profile | null
}

export default function CartView({ initialItems, userEmail, profile }: CartViewProps) {
  const [items, setItems] = useState<CartItem[]>(initialItems)
  const [shippingAddress, setShippingAddress] = useState(profile?.address || '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  React.useEffect(() => {
    if (profile?.address && !shippingAddress) {
      setShippingAddress(profile.address)
    }
  }, [profile])

  const subtotal = items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0)
  const shipping = 0
  const total = subtotal + shipping

  // Calcular retornos ganados
  const tier = profile?.membership_tier
  const rewardEarned = items.reduce((acc, item) => {
    if (!tier || !item.product) return acc
    const rate = tier === 'premium' ? (item.product.return_rate_premium || 10.00) : (item.product.return_rate_basic || 2.00)
    return acc + (item.product.price * item.quantity * (rate / 100))
  }, 0)

  const rewardIfPremium = items.reduce((acc, item) => {
    if (!item.product) return acc
    const rate = item.product.return_rate_premium || 10.00
    return acc + (item.product.price * item.quantity * (rate / 100))
  }, 0)

  // Verificar si hay artículos de prestigio bloqueados por membresía
  const hasRestrictedPrestigeItems = items.some(item => item.product?.is_prestige && tier !== 'premium')

  // Actualizar cantidad de un elemento
  const handleQuantityChange = async (itemId: string, currentQty: number, change: number, maxStock: number) => {
    const newQty = currentQty + change
    if (newQty < 1 || newQty > maxStock || loading) return

    const updatedItems = items.map(item => 
      item.id === itemId ? { ...item, quantity: newQty } : item
    )
    setItems(updatedItems)

    try {
      const res = await updateCartItemAction(itemId, newQty)
      if (!res.success) {
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
    if (!shippingAddress.trim() || items.length === 0 || loading || hasRestrictedPrestigeItems) return

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
      <div className="bg-bg-surface p-12 rounded-2xl border border-border-hairline text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 bg-accent-acceso-tint text-accent-acceso rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-[28px] font-display font-semibold text-text-primary">Compra Confirmada</h2>
          <p className="text-text-secondary text-[17px] leading-relaxed">
            Hemos registrado tu pedido. Te enviaremos un correo de confirmación a <strong className="text-text-primary">{userEmail}</strong> con los detalles de rastreo de tu paquete.
          </p>
        </div>
        <div className="border-t border-border-hairline pt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-accent-acceso hover:bg-accent-acceso/95 text-bg-surface font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors w-full"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-bg-surface p-12 rounded-2xl border border-border-hairline text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 bg-bg-base border border-border-hairline text-text-secondary rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-display font-semibold text-text-primary">Tu carrito está vacío</h2>
          <p className="text-text-secondary text-sm">Agrega productos premium para comenzar tu compra.</p>
        </div>
        <Link
          href="/"
          className="inline-block bg-text-primary hover:bg-text-primary/95 text-bg-surface font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-colors"
        >
          Explorar catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <h1 className="text-[36px] lg:text-[56px] font-display font-semibold tracking-tight text-text-primary leading-[1.1]">Mi Carrito</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Lista de productos en el carrito */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border-hairline pb-4 mb-4">
            <h2 className="text-lg font-display font-semibold text-text-primary">Artículos seleccionados ({items.length})</h2>
          </div>
          
          <div className="bg-bg-surface rounded-2xl border border-border-hairline divide-y divide-border-hairline overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                  <img
                    src={item.product?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop'}
                    alt={item.product?.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-border-hairline flex-shrink-0"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                        {item.product?.category}
                      </span>
                      {item.product?.is_prestige && (
                        <span className="bg-accent-signature-tint border border-accent-signature/25 text-accent-signature text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded">
                          Prestige
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-text-primary text-[17px] leading-snug truncate max-w-[200px] sm:max-w-[300px]">
                      {item.product?.title}
                    </h3>
                    {item.product?.is_prestige && tier !== 'premium' && (
                      <p className="text-[10px] text-accent-alert font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                        <Lock className="w-3.5 h-3.5" /> Requiere Membresía Signature
                      </p>
                    )}
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-[17px] font-bold font-mono text-text-primary">
                        ${item.product?.price.toLocaleString('es-MX')} MXN
                      </span>
                      {item.product?.original_price && (
                        <span className="text-xs font-mono text-text-secondary line-through">
                          ${item.product?.original_price.toLocaleString('es-MX')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controles de cantidad y eliminación */}
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-border-hairline/60 sm:border-none pt-4 sm:pt-0">
                  <div className="flex items-center border border-border-hairline rounded-lg overflow-hidden bg-bg-base">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, item.quantity, -1, item.product?.inventory || 99)}
                      className="p-2 hover:bg-border-hairline text-text-secondary transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-text-primary font-mono select-none">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, item.quantity, 1, item.product?.inventory || 99)}
                      className="p-2 hover:bg-border-hairline text-text-secondary transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-6">
                    <span className="text-[17px] font-bold font-mono text-text-primary text-right min-w-[90px]">
                      ${((item.product?.price || 0) * item.quantity).toLocaleString('es-MX')}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-text-secondary hover:text-accent-alert p-1.5 rounded-full hover:bg-accent-alert/5 transition-colors"
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
          <div className="border-b border-border-hairline pb-4 mb-4">
            <h2 className="text-lg font-display font-semibold text-text-primary">Resumen</h2>
          </div>

          <div className="bg-bg-surface p-6 rounded-2xl border border-border-hairline space-y-6">
            <div className="space-y-3 text-sm border-b border-border-hairline pb-6">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span className="font-bold font-mono text-text-primary">${subtotal.toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Envío (DHL / FedEx)</span>
                <span className="font-bold font-mono text-accent-acceso uppercase text-xs">Gratis</span>
              </div>
              
              {/* Activos Club Estimados */}
              <div className="bg-bg-base p-4 rounded-xl border border-border-hairline space-y-2 text-left mt-2">
                <div className="flex items-center justify-between text-[10px] text-text-secondary">
                  <span className="font-bold uppercase tracking-wider flex items-center text-text-primary gap-1">
                    <Coins className="w-4 h-4 text-accent-acceso" /> Retorno Activo Estimado
                  </span>
                  {tier ? (
                    <span className="text-[9px] font-mono bg-accent-acceso-tint border border-accent-acceso/25 text-accent-acceso px-1.5 rounded font-bold uppercase">
                      Socio {tier === 'premium' ? 'Signature' : 'Acceso'}
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono bg-bg-surface border border-border-hairline text-text-secondary px-1.5 rounded font-bold uppercase">
                      Sin Membresía
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-xs text-text-secondary">Total a acumular:</span>
                  <span className="text-[17px] font-bold font-mono text-accent-acceso">${rewardEarned.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                
                {!tier && (
                  <p className="text-[10px] text-text-secondary leading-normal">
                    <Link href="/memberships" className="text-text-primary hover:text-accent-acceso font-bold underline">Suscribirse hoy</Link> para ganar activos de retorno en este pedido.
                  </p>
                )}
                {tier === 'basic' && (
                  <p className="text-[10px] text-text-secondary leading-normal">
                    Haciendo upgrade a <Link href="/memberships" className="text-accent-signature hover:underline font-bold">Signature</Link> acumularías <span className="font-bold text-accent-signature font-mono">${rewardIfPremium.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </p>
                )}
              </div>

              <div className="flex justify-between text-text-primary pt-4">
                <span className="font-semibold">Total a pagar</span>
                <span className="text-[22px] font-bold font-mono text-text-primary">${total.toLocaleString('es-MX')}</span>
              </div>
            </div>

            {/* Formulario de envío */}
            <form onSubmit={handleCheckout} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="address" className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                  Dirección de Envío (México)
                </label>
                <textarea
                  id="address"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Calle, Número, Colonia, C.P., Municipio, Estado"
                  rows={3}
                  className="w-full text-sm bg-bg-base text-text-primary placeholder-text-secondary/60 p-3.5 rounded-xl border border-border-hairline focus:outline-none focus:border-text-secondary font-mono"
                />
              </div>

              {hasRestrictedPrestigeItems && (
                <div className="bg-accent-alert/5 border border-accent-alert/20 text-accent-alert text-xs p-5 rounded-xl font-semibold space-y-3 text-left leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[10px]"><AlertCircle className="w-4 h-4" /> Compra Bloqueada</p>
                  <p className="text-[11px] text-accent-alert/80">Tienes artículos de marcas de prestigio que requieren Membresía Signature. Adquiere Signature o elimina los productos de Prestige para poder continuar.</p>
                  <Link href="/memberships" className="flex items-center justify-center gap-1.5 bg-accent-signature hover:bg-accent-signature/95 text-bg-surface text-[10px] font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl transition-colors text-center w-full">
                    <Crown className="w-3.5 h-3.5" /> Adquirir Signature
                  </Link>
                </div>
              )}

              {error && (
                <div className="bg-accent-alert/5 border border-accent-alert/20 text-accent-alert text-xs p-3.5 rounded-xl font-semibold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !shippingAddress.trim() || hasRestrictedPrestigeItems}
                className="w-full bg-text-primary hover:bg-text-primary/95 disabled:bg-border-hairline disabled:text-text-secondary/55 text-bg-surface font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 shadow-md disabled:cursor-not-allowed"
              >
                <CreditCard className="w-4 h-4" />
                <span>{loading ? 'Procesando...' : 'Finalizar Pedido y Pagar'}</span>
              </button>
            </form>

            <div className="space-y-3 pt-2 border-t border-border-hairline/60">
              <div className="flex items-center space-x-2.5 text-xs text-text-secondary font-mono">
                <Truck className="w-4 h-4 text-accent-acceso" />
                <span>Entrega estimada: 3 a 5 días hábiles</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs text-text-secondary font-mono">
                <ShieldCheck className="w-4 h-4 text-accent-acceso" />
                <span>Transacciones 100% encriptadas y protegidas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

