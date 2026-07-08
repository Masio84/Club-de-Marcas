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
    <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-24">
      {/* Header */}
      <div className="text-left max-w-3xl space-y-6">
        <h1 className="text-[36px] lg:text-[56px] font-display font-semibold tracking-tight text-text-primary leading-[1.1]">
          Tasas de membresía y élite patrimonial.
        </h1>
        <p className="text-[17px] text-text-secondary leading-relaxed max-w-xl">
          En Club de Marcas no solo adquieres artículos premium de lujo a precios outlet; cada compra te devuelve Activos Club en tu cuenta que puedes hacer crecer en nuestra Bóveda de Rendimiento a plazo fijo.
        </p>
      </div>

      {/* Alertas */}
      {message && (
        <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between shadow-sm animate-fade-in ${
          message.type === 'success' ? 'bg-accent-acceso-tint border-accent-acceso/30 text-accent-acceso' : 'bg-accent-alert/10 border-accent-alert/30 text-accent-alert'
        }`}>
          <div className="flex items-center space-x-3">
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-text-secondary hover:text-text-primary transition-colors ml-4">✕</button>
        </div>
      )}

      {/* Comparativa Gráfica SVG */}
      <div className="bg-bg-surface border border-border-hairline rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="border-b border-border-hairline pb-4">
          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Proyección Visual</span>
          <h4 className="font-display font-semibold text-text-primary text-[18px]">Rendimiento Comparativo: Acceso vs Signature</h4>
        </div>
        <div className="relative py-4 flex items-center justify-center min-h-[160px]">
          <svg className="w-full h-32 overflow-visible" viewBox="0 0 500 120" fill="none">
            <line x1="0" y1="90" x2="500" y2="90" stroke="#E4E7EC" strokeDasharray="3 3" />
            <line x1="0" y1="50" x2="500" y2="50" stroke="#E4E7EC" strokeDasharray="3 3" />
            <line x1="0" y1="10" x2="500" y2="10" stroke="#E4E7EC" strokeDasharray="3 3" />
            
            {/* Línea de Acceso */}
            <path d="M 20 90 L 250 70 L 480 50" stroke="var(--accent-acceso)" strokeWidth="2" strokeLinecap="round" />
            {/* Línea de Signature */}
            <path d="M 20 70 L 250 30 L 480 10" stroke="var(--accent-signature)" strokeWidth="2.5" strokeLinecap="round" />
            
            <circle cx="20" cy="90" r="4.5" fill="var(--accent-acceso)" />
            <text x="28" y="94" fill="var(--accent-acceso)" className="font-mono text-[9px] font-bold">2% Retorno</text>
            
            <circle cx="250" cy="70" r="4.5" fill="var(--accent-acceso)" />
            <text x="258" y="74" fill="var(--accent-acceso)" className="font-mono text-[9px] font-bold">5% Retorno Máx</text>
            
            <circle cx="480" cy="50" r="4.5" fill="var(--accent-acceso)" />
            <text x="390" y="58" fill="var(--accent-acceso)" className="font-mono text-[9px] font-bold">15% Bóveda Máx</text>
            
            <circle cx="20" cy="70" r="4.5" fill="var(--accent-signature)" />
            <text x="28" y="66" fill="var(--accent-signature)" className="font-mono text-[9px] font-bold">10% Retorno</text>
            
            <circle cx="250" cy="30" r="4.5" fill="var(--accent-signature)" />
            <text x="258" y="26" fill="var(--accent-signature)" className="font-mono text-[9px] font-bold">15% Retorno Máx</text>
            
            <circle cx="480" cy="10" r="4.5" fill="var(--accent-signature)" />
            <text x="380" y="18" fill="var(--accent-signature)" className="font-mono text-[9px] font-bold">17% Bóveda Máx</text>
          </svg>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between text-xs text-text-secondary font-mono pt-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-accent-acceso rounded-full"></span> Socio Acceso: Retorno de compras base + Inversiones en Bóveda hasta 15%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-accent-signature rounded-full"></span> Socio Signature: Retorno Premium de hasta 15% + Bóveda hasta 17%
          </span>
        </div>
      </div>

      {/* Grid de Membresías (Term sheets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch max-w-4xl mx-auto">
        
        {/* MEMBRESÍA ACCESO */}
        <div className={`relative flex flex-col justify-between p-8 rounded-2xl bg-bg-surface border border-border-hairline transition-all duration-300 ${
          currentTier === 'basic' ? 'ring-2 ring-accent-acceso/30 border-accent-acceso/50' : 'hover:border-text-secondary/20'
        }`}>
          {currentTier === 'basic' && (
            <span className="absolute -top-3 left-6 bg-accent-acceso-tint border border-accent-acceso/35 text-accent-acceso text-[10px] font-mono font-bold uppercase tracking-wider py-0.5 px-3 rounded">
              Socio Activo
            </span>
          )}
          
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-display font-semibold text-text-primary">Acceso</h3>
                <p className="text-xs text-text-secondary mt-1">El inicio inteligente en el club</p>
              </div>
              <div className="p-3 bg-bg-base border border-border-hairline rounded-xl">
                <Landmark className="w-5 h-5 text-text-secondary" />
              </div>
            </div>

            <div className="flex items-baseline mb-8 border-b border-border-hairline/60 pb-6">
              <span className="text-[36px] font-bold font-mono text-text-primary">$99</span>
              <span className="text-text-secondary font-semibold ml-1 text-sm">MXN / mes</span>
            </div>

            <p className="text-sm text-text-secondary mb-8">
              Ideal para quienes desean adquirir artículos participantes con retornos estándar y comenzar a acumular rendimiento a plazos.
            </p>

            <div className="space-y-4 mb-8 text-[14px]">
              <div className="flex items-center justify-between py-2 border-b border-border-hairline/40">
                <span className="text-text-secondary">Retorno de Compra</span>
                <span className="font-mono font-bold text-text-primary">Hasta 5%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border-hairline/40">
                <span className="text-text-secondary">Catálogo Disponible</span>
                <span className="font-mono font-bold text-text-primary">Estándar</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border-hairline/40">
                <span className="text-text-secondary">Tasa en Bóveda</span>
                <span className="font-mono font-bold text-text-primary">5% - 15%</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-secondary">Soporte Tecnológico</span>
                <span className="font-mono font-bold text-text-primary">WhatsApp</span>
              </div>
            </div>
          </div>

          <div>
            {currentTier === 'basic' ? (
              <button
                onClick={() => handleSubscribe(null)}
                disabled={actionLoading !== null}
                className="w-full py-3 px-6 rounded-xl border border-accent-alert/20 text-accent-alert bg-accent-alert/5 hover:bg-accent-alert/10 font-bold transition-all text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {actionLoading === 'cancel' ? 'Cancelando...' : 'Cancelar Suscripción'}
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe('basic')}
                disabled={actionLoading !== null}
                className="w-full py-3 px-6 rounded-xl bg-text-primary hover:bg-text-primary/90 text-bg-surface font-bold transition-all text-xs uppercase tracking-wider disabled:opacity-50 animate-shine-sweep shadow-md"
              >
                {actionLoading === 'basic' ? 'Procesando...' : 'Adquirir Acceso'}
              </button>
            )}
          </div>
        </div>

        {/* MEMBRESÍA SIGNATURE */}
        <div className={`relative flex flex-col justify-between p-8 rounded-2xl bg-bg-surface border border-border-hairline transition-all duration-300 ${
          currentTier === 'premium' ? 'ring-2 ring-accent-signature/30 border-accent-signature/50' : 'hover:border-text-secondary/20'
        }`}>
          {currentTier === 'premium' ? (
            <span className="absolute -top-3 left-6 bg-accent-signature-tint border border-accent-signature/35 text-accent-signature text-[10px] font-mono font-bold uppercase tracking-wider py-0.5 px-3 rounded">
              Socio Activo
            </span>
          ) : (
            <span className="absolute -top-3 left-6 bg-accent-signature-tint border border-accent-signature/35 text-accent-signature text-[10px] font-mono font-bold uppercase tracking-wider py-0.5 px-3 rounded">
              Recomendada
            </span>
          )}
          
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-display font-semibold text-text-primary">Signature</h3>
                <p className="text-xs text-text-secondary mt-1">El estatus de élite patrimonial</p>
              </div>
              <div className="p-3 bg-accent-signature-tint text-accent-signature rounded-xl">
                <Crown className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline mb-8 border-b border-border-hairline/60 pb-6">
              <span className="text-[36px] font-bold font-mono text-text-primary">$399</span>
              <span className="text-text-secondary font-semibold ml-1 text-sm">MXN / mes</span>
            </div>

            <p className="text-sm text-text-secondary mb-8">
              Para inversionistas y compradores de lujo que buscan maximizar el retorno de activos y gozar de privilegios exclusivos.
            </p>

            <div className="space-y-4 mb-8 text-[14px]">
              <div className="flex items-center justify-between py-2 border-b border-border-hairline/40">
                <span className="text-text-secondary">Retorno de Compra</span>
                <span className="font-mono font-bold text-accent-acceso">10% - 15%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border-hairline/40">
                <span className="text-text-secondary">Catálogo Disponible</span>
                <span className="font-mono font-bold text-accent-signature">Prestige & Estándar</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border-hairline/40">
                <span className="text-text-secondary">Tasa en Bóveda</span>
                <span className="font-mono font-bold text-accent-acceso">7% - 17% (+2% Preferencial)</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-text-secondary">Envíos Asegurados</span>
                <span className="font-mono font-bold text-text-primary">Prioritario Gratis</span>
              </div>
            </div>
          </div>

          <div>
            {currentTier === 'premium' ? (
              <button
                onClick={() => handleSubscribe(null)}
                disabled={actionLoading !== null}
                className="w-full py-3 px-6 rounded-xl border border-accent-alert/20 text-accent-alert bg-accent-alert/5 hover:bg-accent-alert/10 font-bold transition-all text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {actionLoading === 'cancel' ? 'Cancelando...' : 'Cancelar Suscripción'}
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe('premium')}
                disabled={actionLoading !== null}
                className="w-full py-3 px-6 rounded-xl bg-accent-signature hover:bg-accent-signature/90 text-bg-surface font-bold transition-all text-xs uppercase tracking-wider disabled:opacity-50 text-center animate-shine-sweep shadow-md"
              >
                {actionLoading === 'premium' ? 'Procesando...' : (currentTier === 'basic' ? 'Upgrade a Signature' : 'Adquirir Signature')}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Sección Informativa Inferior (Sin cajas ni fondos) */}
      <div className="pt-16 border-t border-border-hairline">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-text-primary text-lg">Compras Premium</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              Adquiere tenis, relojes, bolsas y más artículos de marcas de prestigio mundial a precios outlet insuperables con autenticación verificada.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-text-primary text-lg">Acumula Activos Club</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              Recupera un porcentaje inmediato de cada compra abonado como Activos Club directo a tu cuenta para uso en la plataforma.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-semibold text-text-primary text-lg">Multiplica a Plazos</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              Congela tus activos a plazos fijos en nuestra Bóveda de Rendimiento para generar intereses anuales con total seguridad financiera.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
