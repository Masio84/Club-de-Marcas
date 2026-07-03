'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { 
  User, Phone, MapPin, Camera, Save, CheckCircle, AlertCircle, Loader2, 
  ShoppingBag, Calendar, CreditCard, Tag, Star, ChevronDown, ChevronUp 
} from 'lucide-react'
import { updateProfileAction, createProductReviewAction } from '@/app/actions'
import type { Profile, Order, ProductReview } from '@/utils/data-service'

interface ProfileFormProps {
  initialProfile: Profile
  initialOrders: Order[]
  initialReviews: ProductReview[]
}

export default function ProfileForm({ initialProfile, initialOrders, initialReviews }: ProfileFormProps) {
  // Estado de Pestaña activa
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile')

  // Estados del Perfil
  const [fullName, setFullName] = useState(initialProfile.full_name || '')
  const [phone, setPhone] = useState(initialProfile.phone || '')
  const [address, setAddress] = useState(initialProfile.address || '')
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || '')
  const [avatarPreview, setAvatarPreview] = useState(initialProfile.avatar_url || '')
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Estados del Historial de Compras y Reseñas
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews)
  const [ratingStates, setRatingStates] = useState<Record<string, { rating: number; hoverRating: number; comment: string; isSubmitting: boolean; isOpen: boolean }>>({})

  // Manejar cambio de avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Enviar cambios del perfil
  const handleSubmitProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus(null)

    const formData = new FormData(e.currentTarget)
    formData.append('current_avatar_url', avatarUrl)

    startTransition(async () => {
      const res = await updateProfileAction(null, formData)
      if (res?.error) {
        setStatus({ type: 'error', message: res.error })
      } else if (res?.success) {
        setStatus({ type: 'success', message: res.success })
      }
    })
  }

  // Inicializar o alternar la apertura del formulario de calificación
  const toggleRatingForm = (productId: string) => {
    setRatingStates(prev => ({
      ...prev,
      [productId]: {
        rating: prev[productId]?.rating || 5,
        hoverRating: 0,
        comment: prev[productId]?.comment || '',
        isSubmitting: false,
        isOpen: !prev[productId]?.isOpen
      }
    }))
  }

  // Cambiar puntuación
  const setProductRating = (productId: string, rating: number) => {
    setRatingStates(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        rating
      }
    }))
  }

  // Cambiar hover de puntuación
  const setProductHoverRating = (productId: string, hoverRating: number) => {
    setRatingStates(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        hoverRating
      }
    }))
  }

  // Cambiar comentario
  const setProductComment = (productId: string, comment: string) => {
    setRatingStates(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        comment
      }
    }))
  }

  // Enviar calificación a servidor
  const submitRating = async (productId: string) => {
    const state = ratingStates[productId]
    if (!state) return

    setRatingStates(prev => ({
      ...prev,
      [productId]: { ...prev[productId], isSubmitting: true }
    }))

    const formData = new FormData()
    formData.append('product_id', productId)
    formData.append('rating', state.rating.toString())
    formData.append('comment', state.comment)

    const res = await createProductReviewAction(null, formData)

    setRatingStates(prev => ({
      ...prev,
      [productId]: { ...prev[productId], isSubmitting: false }
    }))

    if (res?.error) {
      alert(res.error)
    } else if (res?.success) {
      // Guardar calificación localmente
      setReviews(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          product_id: productId,
          user_id: initialProfile.id,
          rating: state.rating,
          comment: state.comment,
          created_at: new Date().toISOString()
        }
      ])
      // Cerrar formulario
      setRatingStates(prev => ({
        ...prev,
        [productId]: { ...prev[productId], isOpen: false }
      }))
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Botones de Pestaña */}
      <div className="flex border-b border-gray-150 text-left">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 py-3 px-6 text-sm font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'border-emerald text-navy'
              : 'border-transparent text-gray-400 hover:text-navy'
          }`}
        >
          <User className="w-4 h-4 text-emerald" />
          <span>Mi Cuenta</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center space-x-2 py-3 px-6 text-sm font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'border-emerald text-navy'
              : 'border-transparent text-gray-400 hover:text-navy'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-emerald" />
          <span>Mis Compras</span>
          {initialOrders.length > 0 && (
            <span className="bg-emerald/10 text-emerald-850 text-[10px] px-2 py-0.5 rounded-full font-extrabold ml-1">
              {initialOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* PESTAÑA 1: MI PERFIL */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmitProfile} className="space-y-6 animate-fadeIn">
          {/* 1. SECCIÓN DE AVATAR / FOTO */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald/20 shadow-md bg-navy-light/10 flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={fullName || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <label
                htmlFor="avatar_file"
                className="absolute bottom-1 right-1 bg-emerald hover:bg-emerald-hover text-navy p-2.5 rounded-full cursor-pointer shadow-lg hover:scale-105 transition-all"
                title="Cambiar fotografía"
              >
                <Camera className="w-5 h-5 font-bold" />
                <input
                  type="file"
                  id="avatar_file"
                  name="avatar_file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
              Foto de Socio Premium
            </p>
          </div>

          {/* MENSAJES DE ESTADO */}
          {status && (
            <div
              className={`p-4 rounded-xl border flex items-start space-x-3 text-sm ${
                status.type === 'success'
                  ? 'bg-emerald/10 border-emerald/30 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              )}
              <span className="font-semibold">{status.message}</span>
            </div>
          )}

          {/* CAMPOS DE TEXTO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {/* Nombre completo */}
            <div className="md:col-span-2">
              <label htmlFor="full_name" className="block text-[10px] font-black uppercase text-navy/70 tracking-wider mb-1.5">
                Nombre Completo
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="full_name"
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-255 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald bg-light-grey/30 text-sm font-medium text-navy placeholder-gray-400"
                  placeholder="Ej. Juan Pérez Garza"
                  required
                />
              </div>
            </div>

            {/* Correo Electrónico (Solo Lectura) */}
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-450 tracking-wider mb-1.5">
                Correo Electrónico (No modificable)
              </label>
              <input
                type="email"
                value={initialProfile.email}
                disabled
                className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm font-medium text-gray-450 cursor-not-allowed"
              />
            </div>

            {/* Teléfono Celular */}
            <div>
              <label htmlFor="phone" className="block text-[10px] font-black uppercase text-navy/70 tracking-wider mb-1.5">
                Teléfono Celular
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-255 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald bg-light-grey/30 text-sm font-medium text-navy placeholder-gray-400"
                  placeholder="Ej. 5512345678"
                />
              </div>
            </div>

            {/* Domicilio de entrega */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-[10px] font-black uppercase text-navy/70 tracking-wider mb-1.5">
                Dirección de Envío
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  name="address"
                  id="address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-255 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald bg-light-grey/30 text-sm font-medium text-navy placeholder-gray-400 resize-none"
                  placeholder="Ej. Calle Paseo de la Reforma #123, Col. Juárez, Cuauhtémoc, CP 06600, CDMX"
                />
              </div>
            </div>
          </div>

          {/* BOTÓN DE GUARDADO */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center space-x-2 bg-navy hover:bg-navy-light text-pure-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-emerald" />
                <span>Guardando cambios...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5 text-emerald" />
                <span>Guardar Perfil de Socio</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* PESTAÑA 2: HISTORIAL DE COMPRAS */}
      {activeTab === 'orders' && (
        <div className="space-y-6 text-left animate-fadeIn">
          {initialOrders.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-gray-200 rounded-3xl space-y-4">
              <div className="inline-flex p-4 rounded-full bg-emerald/10 text-emerald mb-2">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-navy uppercase">Sin Pedidos Aún</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                No hemos encontrado compras realizadas en tu historial. ¡Revisa nuestro catálogo premium para encontrar descuentos del 30% al 70%!
              </p>
              <Link
                href="/"
                className="inline-block bg-emerald text-navy font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-xl hover:bg-emerald-hover transition-colors"
              >
                Comenzar a Comprar
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {initialOrders.map(order => (
                <div 
                  key={order.id} 
                  className="bg-white border border-gray-250 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  {/* Cabecera del pedido */}
                  <div className="bg-gray-50 p-5 border-b border-gray-150 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-gray-500">
                    <div className="space-y-1">
                      <span className="uppercase text-[9px] font-black tracking-widest block text-gray-400">Fecha</span>
                      <div className="flex items-center space-x-1.5 text-navy font-bold">
                        <Calendar className="w-3.5 h-3.5 text-emerald" />
                        <span>{new Date(order.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="uppercase text-[9px] font-black tracking-widest block text-gray-400">Total</span>
                      <div className="flex items-center space-x-1.5 text-navy font-bold">
                        <CreditCard className="w-3.5 h-3.5 text-emerald" />
                        <span>${order.total.toFixed(2)} MXN</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="uppercase text-[9px] font-black tracking-widest block text-gray-400">ID Pedido</span>
                      <span className="font-mono text-navy text-[11px] font-bold block select-all">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1 flex flex-col justify-center text-left">
                      <span className="uppercase text-[9px] font-black tracking-widest block text-gray-400 mb-0.5">Estado</span>
                      <div>
                        {order.status === 'completed' ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald/10 text-emerald-855">
                            Entregado
                          </span>
                        ) : order.status === 'shipped' ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-800">
                            Enviado
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-800">
                            Procesando
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo del pedido (Artículos) */}
                  <div className="p-5 space-y-4">
                    {order.items?.map(item => {
                      const alreadyReviewed = reviews.find(r => r.product_id === item.product_id)
                      const formState = ratingStates[item.product_id] || { rating: 5, hoverRating: 0, comment: '', isSubmitting: false, isOpen: false }

                      return (
                        <div 
                          key={item.id} 
                          className="flex flex-col space-y-3.5 pb-4 last:pb-0 last:border-b-0 border-b border-gray-100"
                        >
                          <div className="flex items-center space-x-4">
                            {/* Imagen */}
                            <div className="w-16 h-16 rounded-2xl border border-gray-150 overflow-hidden bg-gray-50 flex-shrink-0">
                              {item.product?.image_url ? (
                                <img
                                  src={item.product.image_url}
                                  alt={item.product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ShoppingBag className="w-8 h-8 text-gray-300 m-4" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black text-navy truncate uppercase text-left">
                                {item.product?.title || 'Artículo Sin Título'}
                              </h4>
                              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5 text-left">
                                Cantidad: {item.quantity} &bull; ${item.price.toFixed(2)} c/u
                              </p>
                            </div>

                            {/* Mostrar Calificación o botón para Calificar */}
                            <div className="flex-shrink-0 text-right">
                              {alreadyReviewed ? (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-end text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className={`w-3.5 h-3.5 fill-current ${
                                          i < alreadyReviewed.rating ? 'text-amber-400' : 'text-gray-200'
                                        }`} 
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[10px] font-black uppercase text-emerald block">
                                    Ya calificado
                                  </span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => toggleRatingForm(item.product_id)}
                                  className="flex items-center space-x-1 border border-emerald text-emerald hover:bg-emerald hover:text-navy px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                                >
                                  <span>Calificar</span>
                                  {formState.isOpen ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Formulario de Calificación */}
                          {formState.isOpen && !alreadyReviewed && (
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 space-y-3.5 animate-fadeIn">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-wider text-navy">
                                  Califica tu compra:
                                </span>
                                
                                {/* Estrellas selectoras interactivas */}
                                <div className="flex items-center space-x-1">
                                  {[1, 2, 3, 4, 5].map(star => {
                                    const isActive = star <= (formState.hoverRating || formState.rating)
                                    return (
                                      <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setProductHoverRating(item.product_id, star)}
                                        onMouseLeave={() => setProductHoverRating(item.product_id, 0)}
                                        onClick={() => setProductRating(item.product_id, star)}
                                        className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                                      >
                                        <Star 
                                          className={`w-6 h-6 ${
                                            isActive ? 'fill-current text-amber-400' : 'text-gray-300'
                                          }`} 
                                        />
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">
                                  Tu opinión sobre el producto (opcional)
                                </label>
                                <textarea
                                  value={formState.comment}
                                  onChange={(e) => setProductComment(item.product_id, e.target.value)}
                                  rows={2}
                                  placeholder="¿Qué te pareció el artículo? Calidad, empaque, talla..."
                                  className="w-full text-xs font-medium p-3 bg-white border border-gray-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald resize-none text-navy"
                                />
                              </div>

                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => submitRating(item.product_id)}
                                  disabled={formState.isSubmitting}
                                  className="bg-navy hover:bg-navy-light text-pure-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {formState.isSubmitting ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald" />
                                      <span>Guardando...</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald" />
                                      <span>Guardar Calificación</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Mostrar reseña enviada si ya fue calificada en esta sesión */}
                          {alreadyReviewed && alreadyReviewed.comment && (
                            <div className="bg-gray-50/50 px-4 py-2.5 rounded-2xl border border-gray-100 text-xs text-navy/70 font-medium text-left">
                              <strong>Tu comentario:</strong> &ldquo;{alreadyReviewed.comment}&rdquo;
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Detalles adicionales del pedido */}
                  <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                    <span className="truncate"><strong>Dirección:</strong> {order.shipping_address}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
