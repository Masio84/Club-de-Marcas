'use client'

import React, { useState, useEffect } from 'react'
import { Landmark, ArrowUpRight, ArrowDownRight, Coins, Calendar, Sparkles, Clock, AlertCircle, Crown, ShieldCheck } from 'lucide-react'
import { createInvestmentAction, simulateTermCompletionAction } from '@/app/actions'
import { type Profile, type TermInvestment, type RewardTransaction } from '@/utils/data-service'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface VaultViewProps {
  initialProfile: Profile | null
  initialInvestments: TermInvestment[]
  initialTransactions: RewardTransaction[]
}

export default function VaultView({ initialProfile, initialInvestments, initialTransactions }: VaultViewProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [investments, setInvestments] = useState<TermInvestment[]>(initialInvestments)
  const [transactions, setTransactions] = useState<RewardTransaction[]>(initialTransactions)
  const router = useRouter()

  // Formulario
  const [amount, setAmount] = useState<string>('')
  const [term, setTerm] = useState<number>(3) // 3 meses por defecto
  const [actionLoading, setActionLoading] = useState(false)
  const [matureLoadingId, setMatureLoadingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Sincronizar el estado del cliente cuando el Server Component refresca las props
  useEffect(() => {
    setProfile(initialProfile)
    setInvestments(initialInvestments)
    setTransactions(initialTransactions)
  }, [initialProfile, initialInvestments, initialTransactions])

  const isPremium = profile?.membership_tier === 'premium'
  const isBasic = profile?.membership_tier === 'basic'
  
  // Tasas de interés anuales basadas en la membresía
  const getAnnualRate = (months: number) => {
    if (months === 1) return isPremium ? 7 : 5
    if (months === 3) return isPremium ? 10 : 8
    if (months === 6) return isPremium ? 14 : 12
    if (months === 12) return isPremium ? 17 : 15
    return 5
  }

  const annualRate = getAnnualRate(term)
  const numericAmount = parseFloat(amount) || 0
  const expectedYield = Number((numericAmount * (annualRate / 100) * (term / 12)).toFixed(2))

  const totalLocked = investments
    .filter(i => i.status === 'active')
    .reduce((sum, i) => sum + i.amount, 0)

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    
    if (numericAmount <= 0) {
      setMessage({ type: 'error', text: 'El monto a colocar debe ser mayor que cero.' })
      return
    }

    if (numericAmount > (profile.reward_balance || 0)) {
      setMessage({ type: 'error', text: 'No cuentas con suficientes Activos Club disponibles.' })
      return
    }

    setActionLoading(true)
    setMessage(null)

    try {
      const res = await createInvestmentAction(numericAmount, term)
      if (res.success) {
        setAmount('')
        setMessage({ type: 'success', text: 'Colocación confirmada. Tus activos ya están generando rendimientos.' })
        router.refresh() // Refrescar los Server Props
      } else {
        setMessage({ type: 'error', text: res.error || 'Ocurrió un error inesperado.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error de red al procesar la operación.' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleMature = async (invId: string) => {
    setMatureLoadingId(invId)
    setMessage(null)
    try {
      const res = await simulateTermCompletionAction(invId)
      if (res.success) {
        setMessage({ type: 'success', text: 'Posición liquidada con éxito. El capital y sus intereses fueron devueltos a tu balance.' })
        router.refresh() // Refrescar los Server Props
      } else {
        setMessage({ type: 'error', text: res.error || 'No se pudo liquidar la posición.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error de red al procesar la liquidación.' })
    } finally {
      setMatureLoadingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-8 border-b border-border-hairline">
        <div className="space-y-2">
          <h1 className="text-[36px] lg:text-[56px] font-display font-semibold tracking-tight text-text-primary leading-[1.1]">Mi Bóveda de Activos</h1>
          <p className="text-[17px] text-text-secondary leading-relaxed max-w-xl">Monitorea tus retornos y pon a trabajar tu capital acumulado en cuentas a plazo fijo.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3 text-xs font-mono uppercase tracking-wider">
          {isPremium ? (
            <span className="bg-accent-signature-tint border border-accent-signature/25 text-accent-signature py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold">
              <Crown className="w-4 h-4" /> Signature (Tasas +2% Preferencial)
            </span>
          ) : isBasic ? (
            <span className="bg-accent-acceso-tint border border-accent-acceso/25 text-accent-acceso py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4" /> Acceso (Tasas Estándar)
            </span>
          ) : (
            <Link href="/memberships" className="bg-accent-alert/5 border border-accent-alert/20 text-accent-alert hover:bg-accent-alert/10 py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors font-bold">
              <AlertCircle className="w-4 h-4" /> Sin Membresía (Suscribirse)
            </Link>
          )}
        </div>
      </div>

      {/* Alertas */}
      {message && (
        <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between shadow-sm animate-fade-in ${
          message.type === 'success' ? 'bg-accent-acceso-tint border-accent-acceso/30 text-accent-acceso' : 'bg-accent-alert/10 border-accent-alert/30 text-accent-alert'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-text-secondary hover:text-text-primary transition-colors ml-4">✕</button>
        </div>
      )}

      {/* Grid Superior: Balances e Inversión */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        {/* Columna Balances */}
        <div className="flex flex-col gap-6">
          
          {/* Card Disponible */}
          <div className="bg-bg-surface border border-border-hairline p-6 rounded-2xl flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Activos Club Disponibles</span>
              <Coins className="w-5 h-5 text-accent-acceso" />
            </div>
            <div>
              <div className="text-[32px] font-bold font-mono text-text-primary">${(profile?.reward_balance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
              <p className="text-[11px] text-text-secondary font-mono mt-2 uppercase tracking-wider">
                Listos para ser colocados a plazo fijo
              </p>
            </div>
          </div>

          {/* Card Invertido */}
          <div className="bg-bg-surface border border-border-hairline p-6 rounded-2xl flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Saldo en Inversión Activa</span>
              <Landmark className="w-5 h-5 text-accent-signature" />
            </div>
            <div>
              <div className="text-[32px] font-bold font-mono text-text-primary">${totalLocked.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
              <p className="text-[11px] text-text-secondary font-mono mt-2 uppercase tracking-wider">
                Generando rendimientos compuestos
              </p>
            </div>
          </div>

        </div>

        {/* Columna Formulario Invertir */}
        <div className="lg:col-span-2 bg-bg-surface border border-border-hairline p-8 rounded-2xl">
          <h2 className="text-[22px] font-display font-semibold text-text-primary mb-6">Iniciar Nueva Colocación</h2>
          
          {(!profile?.membership_tier) ? (
            <div className="border border-border-hairline rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-4 py-12">
              <AlertCircle className="w-8 h-8 text-accent-alert" />
              <div className="space-y-1">
                <p className="font-bold text-text-primary text-sm uppercase tracking-wider">Se requiere Membresía Activa</p>
                <p className="text-xs text-text-secondary leading-relaxed max-w-sm">Para poder invertir tus Activos Club y generar rendimiento a plazos necesitas una membresía activa (Acceso o Signature).</p>
              </div>
              <Link href="/memberships" className="bg-text-primary hover:bg-text-primary/95 text-bg-surface text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-xl transition-colors">
                Ver Membresías
              </Link>
            </div>
          ) : (
            <form onSubmit={handleInvest} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monto */}
                <div>
                  <label htmlFor="amount" className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">Monto a Invertir (Activos Club)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">$</span>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-bg-base border border-border-hairline focus:border-text-secondary rounded-xl outline-none font-bold text-text-primary transition-colors font-mono"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-text-secondary mt-1.5 block">
                    Disponible: <button type="button" onClick={() => setAmount(String(profile?.reward_balance || 0))} className="text-text-primary hover:text-accent-acceso font-mono font-bold underline">${(profile?.reward_balance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</button>
                  </span>
                </div>

                {/* Plazo */}
                <div>
                  <label htmlFor="term" className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">Plazo de Retención</label>
                  <select
                    id="term"
                    value={term}
                    onChange={(e) => setTerm(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-bg-base border border-border-hairline focus:border-text-secondary rounded-xl outline-none font-bold text-text-primary transition-colors font-mono"
                  >
                    <option value={1}>1 Mes (Tasa: {getAnnualRate(1)}% anual)</option>
                    <option value={3}>3 Meses (Tasa: {getAnnualRate(3)}% anual)</option>
                    <option value={6}>6 Meses (Tasa: {getAnnualRate(6)}% anual)</option>
                    <option value={12}>12 Meses (Tasa: {getAnnualRate(12)}% anual)</option>
                  </select>
                </div>
              </div>

              {/* Detalle de Rendimiento Simulado */}
              {numericAmount > 0 && (
                <div className="bg-bg-base rounded-xl p-4 border border-border-hairline grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-mono">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-text-secondary font-semibold uppercase block">Tasa Anualizada</span>
                    <p className="text-[17px] font-bold text-text-primary">{annualRate}%</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-text-secondary font-semibold uppercase block">Rendimiento Estimado</span>
                    <p className="text-[17px] font-bold text-accent-acceso">+${expectedYield.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-text-secondary font-semibold uppercase block">Monto al Vencer</span>
                    <p className="text-[17px] font-bold text-text-primary">${(numericAmount + expectedYield).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={actionLoading || numericAmount <= 0 || numericAmount > (profile.reward_balance || 0)}
                className="w-full py-3.5 px-6 rounded-xl bg-text-primary hover:bg-text-primary/90 text-bg-surface font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40 flex items-center justify-center space-x-2"
              >
                {actionLoading ? (
                  <span>Creando Inversión...</span>
                ) : (
                  <>
                    <Landmark className="w-4 h-4" />
                    <span>Confirmar e Iniciar Operación</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>

      {/* Grid Inferior: Inversiones Activas e Historial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* INVERSIONES ACTIVAS */}
        <div className="space-y-6">
          <h2 className="text-[22px] font-display font-semibold text-text-primary flex items-center gap-2 border-b border-border-hairline pb-4">
            <Landmark className="w-5 h-5 text-text-primary" /> Posiciones Vigentes
          </h2>

          {investments.length === 0 ? (
            <div className="text-center py-12 text-text-secondary border border-dashed border-border-hairline rounded-xl">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-border-hairline" />
              <p className="font-semibold text-sm">No tienes inversiones vigentes</p>
              <p className="text-xs text-text-secondary mt-1">Tus inversiones a plazos aparecerán aquí.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
              {investments.map((inv) => {
                const percentProgress = Math.min(100, Math.max(0, ((Date.now() - new Date(inv.start_date).getTime()) / (new Date(inv.end_date).getTime() - new Date(inv.start_date).getTime())) * 100))
                
                return (
                  <div key={inv.id} className="py-5 border-b border-border-hairline last:border-b-0 flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Monto Inmovilizado</span>
                        <p className="text-[22px] font-bold font-mono text-text-primary">${inv.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Rendimiento (+{inv.annual_rate}%)</span>
                        <p className="text-[22px] font-bold font-mono text-accent-acceso">+${inv.expected_yield.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>

                    {/* Progreso del Plazo */}
                    <div>
                      <div className="flex justify-between text-[10px] text-text-secondary font-mono mb-1">
                        <span>Apertura: {new Date(inv.start_date).toLocaleDateString('es-MX')}</span>
                        <span>Vencimiento: {new Date(inv.end_date).toLocaleDateString('es-MX')}</span>
                      </div>
                      <div className="w-full bg-border-hairline h-1 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${inv.status === 'completed' ? 'bg-accent-acceso' : 'bg-accent-signature'}`} style={{ width: `${inv.status === 'completed' ? 100 : percentProgress}%` }}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className={`text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-md ${
                        inv.status === 'completed' 
                          ? 'bg-accent-acceso-tint text-accent-acceso' 
                          : 'bg-accent-signature-tint text-accent-signature'
                      }`}>
                        {inv.status === 'completed' ? 'Vencido' : 'Activo'}
                      </span>
                      
                      {inv.status === 'active' && (
                        <button
                          onClick={() => handleMature(inv.id)}
                          disabled={matureLoadingId !== null}
                          className="bg-accent-acceso-tint hover:bg-accent-acceso/10 border border-accent-acceso/25 text-accent-acceso text-[10px] font-mono font-bold uppercase tracking-wider py-1.5 px-3.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {matureLoadingId === inv.id ? 'Liquidando...' : 'Liquidar Posición'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* HISTORIAL DE TRANSACCIONES */}
        <div className="space-y-6">
          <h2 className="text-[22px] font-display font-semibold text-text-primary flex items-center gap-2 border-b border-border-hairline pb-4">
            <Clock className="w-5 h-5 text-text-primary" /> Historial de Movimientos
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12 text-text-secondary border border-dashed border-border-hairline rounded-xl">
              <Coins className="w-12 h-12 mx-auto mb-4 text-border-hairline" />
              <p className="font-semibold text-sm">Sin transacciones registradas</p>
              <p className="text-xs text-text-secondary mt-1">Tus movimientos de saldo se reflejarán aquí.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
              {transactions.map((tx) => {
                const isPositive = tx.amount > 0
                
                return (
                  <div key={tx.id} className="py-4 border-b border-border-hairline flex items-center justify-between hover:bg-bg-base/40 px-2 rounded-xl transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${isPositive ? 'bg-accent-acceso-tint text-accent-acceso' : 'bg-bg-base text-text-secondary border border-border-hairline'}`}>
                        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-text-primary leading-tight">{tx.description}</p>
                        <span className="text-[10px] text-text-secondary font-mono">{new Date(tx.created_at).toLocaleString('es-MX')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[17px] font-bold font-mono ${isPositive ? 'text-accent-acceso' : 'text-text-primary'}`}>
                        {isPositive ? '+' : ''}${tx.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
