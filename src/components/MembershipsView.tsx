'use client'

import React, { useState } from 'react'
import { Check, ShieldCheck, Crown, Landmark, Sparkles } from 'lucide-react'
import { subscribeToMembershipAction } from '@/app/actions'
import { type Profile } from '@/utils/data-service'

interface MembershipsViewProps {
  initialProfile: Profile | null
}

export default function MembershipsView({ initialProfile }: MembershipsViewProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubscribe = async (tier: 'basic' | 'premium' | null) => {
    setActionLoading(tier || 'cancel')
    setMessage(null)
    try {
      const res = await subscribeToMembershipAction(tier)
      if (res.success) {
        // Actualizar el perfil localmente en el cliente
        setProfile(prev => {
          if (!prev) return null
          return {
            ...prev,
            membership_tier: tier,
            membership_expires_at: tier ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
          }
        })
        
        setMessage({
          type: 'success',
          text: tier 
            ? `¡Felicidades! Te has suscrito con éxito a la Membresía ${tier === 'premium' ? 'Signature' : 'Acceso'}.`
            : 'Tu membresía ha sido cancelada con éxito.'
        })
        
        // Recargar la ventana para actualizar el navbar
        window.location.reload()
      } else {
        setMessage({ type: 'error', text: res.error || 'Ocurrió un error inesperado.' })
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Error de red al procesar tu solicitud.' })
    } finally {
      setActionLoading(null)
    }
  }

  const currentTier = profile?.membership_tier

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs uppercase bg-emerald/20 text-emerald font-black tracking-widest px-3 py-1 rounded-full">
          Membresías Exclusivas
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-navy mt-4 mb-6 leading-tight tracking-tight">
          Maximiza tus Compras y Conviértelas en <span className="bg-gradient-to-r from-emerald to-teal-500 bg-clip-text text-transparent">Activos de Inversión</span>
        </h1>
        <p className="text-lg text-gray-600">
          En Club de Marcas no solo adquieres productos premium de lujo; cada compra te devuelve **Activos Club** que puedes hacer crecer en nuestra Bóveda de Inversión a plazos.
        </p>
      </div>

      {/* Alertas */}
      {message && (
        <div className={`mb-10 p-4 rounded-xl border text-sm font-semibold flex items-center justify-between shadow-sm animate-fade-in ${
          message.type === 'success' ? 'bg-emerald/10 border-emerald/30 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center space-x-3">
            <span className="text-lg">{message.type === 'success' ? '🛡️' : '⚠️'}</span>
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600 transition-colors ml-4">✕</button>
        </div>
      )}

      {/* Grid de Membresías */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch max-w-4xl mx-auto">
        
        {/* MEMBRESÍA ACCESO (BARATA) */}
        <div className={`relative flex flex-col justify-between p-8 rounded-3xl bg-pure-white border-2 transition-all duration-300 hover:shadow-xl ${
          currentTier === 'basic' 
            ? 'border-navy shadow-lg ring-4 ring-navy/5' 
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          {currentTier === 'basic' && (
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-navy text-pure-white text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-full flex items-center shadow-md">
              <Check className="w-3.5 h-3.5 text-emerald mr-1" /> Tu Membresía Activa
            </span>
          )}
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-navy">Membresía Acceso</h3>
                <p className="text-xs text-gray-400 mt-1">El inicio inteligente en el club</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-2xl">
                <Landmark className="w-6 h-6 text-slate-600" />
              </div>
            </div>

            <div className="flex items-baseline mb-8">
              <span className="text-4xl font-extrabold text-navy">$99</span>
              <span className="text-gray-500 font-semibold ml-1">MXN / mes</span>
            </div>

            <p className="text-sm text-gray-600 mb-8">
              Ideal para quienes desean comprar artículos cotidianos participantes y comenzar a acumular activos de forma inteligente.
            </p>

            <div className="border-t border-gray-100 pt-8 mb-8">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Beneficios de Acceso</h4>
              <ul className="space-y-4 text-sm text-slate-700">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald mr-3 flex-shrink-0" />
                  <span>Retorno Activo estándar (hasta **5%** en compras)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald mr-3 flex-shrink-0" />
                  <span>Acceso al catálogo de categorías y marcas estándar</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald mr-3 flex-shrink-0" />
                  <span>Inversión a plazos fijos con tasas base (desde **5%** hasta **15%** anualizado)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald mr-3 flex-shrink-0" />
                  <span>Soporte por WhatsApp en horario laboral</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            {currentTier === 'basic' ? (
              <button
                onClick={() => handleSubscribe(null)}
                disabled={actionLoading !== null}
                className="w-full py-4 px-6 rounded-2xl border border-gray-300 hover:border-red-300 text-gray-600 hover:text-red-500 hover:bg-red-55 font-bold transition-all text-sm disabled:opacity-50"
              >
                {actionLoading === 'cancel' ? 'Cancelando...' : 'Cancelar Membresía'}
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe('basic')}
                disabled={actionLoading !== null}
                className="w-full py-4 px-6 rounded-2xl bg-navy hover:bg-navy-light text-pure-white font-bold transition-all text-sm shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {actionLoading === 'basic' ? 'Procesando...' : 'Suscribirse a Acceso'}
              </button>
            )}
          </div>
        </div>

        {/* MEMBRESÍA SIGNATURE (CARA - PRESTIGIO) */}
        <div className={`relative flex flex-col justify-between p-8 rounded-3xl bg-navy text-pure-white border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl ${
          currentTier === 'premium' 
            ? 'border-emerald shadow-emerald/10 shadow-2xl ring-4 ring-emerald/20' 
            : 'border-transparent hover:border-emerald/40'
        }`}>
          {/* Fondo luminoso decorativo */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-emerald/20 blur-3xl"></div>
          
          {currentTier === 'premium' ? (
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald text-navy text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-full flex items-center shadow-md">
              <Check className="w-3.5 h-3.5 text-navy mr-1" /> Tu Membresía Activa
            </span>
          ) : (
            <span className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-navy text-[9px] font-black uppercase tracking-wider py-1 px-2.5 rounded-lg flex items-center shadow-md">
              <Sparkles className="w-3 h-3 mr-1 fill-navy" /> Recomendada
            </span>
          )}
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-pure-white">Membresía Signature</h3>
                <p className="text-xs text-emerald font-semibold mt-1">El estatus de élite patrimonial</p>
              </div>
              <div className="p-3 bg-navy-light rounded-2xl text-emerald">
                <Crown className="w-6 h-6" />
              </div>
            </div>

            <div className="flex items-baseline mb-8">
              <span className="text-4xl font-extrabold text-pure-white">$399</span>
              <span className="text-gray-300 font-semibold ml-1">MXN / mes</span>
            </div>

            <p className="text-sm text-gray-300 mb-8">
              Para inversionistas y compradores de marcas de prestigio que buscan maximizar el retorno de activos y gozar de los beneficios más altos del club.
            </p>

            <div className="border-t border-navy-light pt-8 mb-8">
              <h4 className="text-xs font-bold text-emerald uppercase tracking-wider mb-4">Beneficios Exclusivos Signature</h4>
              <ul className="space-y-4 text-sm text-gray-200">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald mr-3 flex-shrink-0" />
                  <span><b>Tasa Premium de Retorno:</b> **10% a 15%** en tus compras de marcas exclusivas</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald mr-3 flex-shrink-0" />
                  <span><b>Acceso Ilimitado Premium:</b> Desbloquea la compra de artículos de marcas de prestigio (exclusivos)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald mr-3 flex-shrink-0" />
                  <span><b>Tasas Preferenciales:</b> **+2% adicional** en la Bóveda de Inversión (hasta **17%** anualizado)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald mr-3 flex-shrink-0" />
                  <span><b>Envíos Asegurados Prioritarios Gratis</b> en todos tus pedidos sin compra mínima</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-emerald mr-3 flex-shrink-0" />
                  <span>Soporte prioritario 24/7 con ejecutivo dedicado</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            {currentTier === 'premium' ? (
              <button
                onClick={() => handleSubscribe(null)}
                disabled={actionLoading !== null}
                className="w-full py-4 px-6 rounded-2xl border border-navy-light hover:border-red-400 text-gray-300 hover:text-red-400 hover:bg-red-950/20 font-bold transition-all text-sm disabled:opacity-50"
              >
                {actionLoading === 'cancel' ? 'Cancelando...' : 'Cancelar Membresía'}
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe('premium')}
                disabled={actionLoading !== null}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald to-teal-500 hover:from-emerald-light hover:to-teal-400 text-navy font-black transition-all text-sm shadow-lg shadow-emerald/20 hover:shadow-xl hover:shadow-emerald/30 disabled:opacity-50"
              >
                {actionLoading === 'premium' ? 'Procesando...' : (currentTier === 'basic' ? 'Hacer Upgrade a Signature' : 'Suscribirse a Signature')}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Sección Informativa Inferior (Fintech) */}
      <div className="mt-20 bg-gradient-to-b from-slate-50 to-slate-100 rounded-3xl p-8 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex space-x-4">
            <div className="p-3 bg-emerald/10 text-emerald rounded-2xl self-start">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-navy text-base mb-2">Compras Premium</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Adquiere tenis, relojes, gorras y más artículos de marcas de prestigio mundial a precios outlet insuperables.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <div className="p-3 bg-emerald/10 text-emerald rounded-2xl self-start">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-navy text-base mb-2">Acumula Activos Club</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Recupera un porcentaje inmediato de cada compra abonado como Activos Club directo a tu cuenta en pesos.
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="p-3 bg-emerald/10 text-emerald rounded-2xl self-start">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-navy text-base mb-2">Multiplica a Plazos</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Congela tus activos a plazos en nuestra Bóveda de Rendimiento para generar intereses anuales con total seguridad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
