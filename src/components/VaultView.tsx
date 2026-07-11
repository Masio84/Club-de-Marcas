'use client'

import React, { useState, useEffect } from 'react'
import { Landmark, ArrowUpRight, ArrowDownRight, Coins, Calendar, Clock, AlertCircle, Crown, ShieldCheck } from 'lucide-react'
import { createReservationAction, simulateReleaseAction } from '@/app/actions'
import { type Profile, type RewardReservation, type RewardTransaction } from '@/utils/data-service'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface VaultViewProps {
  initialProfile: Profile | null
  initialInvestments: RewardReservation[]
  initialTransactions: RewardTransaction[]
}

export default function VaultView({ initialProfile, initialInvestments, initialTransactions }: VaultViewProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [investments, setInvestments] = useState<RewardReservation[]>(initialInvestments)
  const [transactions, setTransactions] = useState<RewardTransaction[]>(initialTransactions)
  const router = useRouter()

  // Track props in state to sync them during render
  const [prevProps, setPrevProps] = useState({
    profile: initialProfile,
    investments: initialInvestments,
    transactions: initialTransactions
  })

  if (
    initialProfile !== prevProps.profile ||
    initialInvestments !== prevProps.investments ||
    initialTransactions !== prevProps.transactions
  ) {
    setPrevProps({
      profile: initialProfile,
      investments: initialInvestments,
      transactions: initialTransactions
    })
    setProfile(initialProfile)
    setInvestments(initialInvestments)
    setTransactions(initialTransactions)
  }

  // Formulario
  const [amount, setAmount] = useState<string>('')
  const [term, setTerm] = useState<number>(3) // 3 meses por defecto
  const [actionLoading, setActionLoading] = useState(false)
  const [matureLoadingId, setMatureLoadingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [now, setNow] = useState<number>(0)

  // Sincronizar el reloj del cliente de manera segura y pura
  useEffect(() => {
    requestAnimationFrame(() => setNow(Date.now()))
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const isPremium = profile?.membership_tier === 'premium'
  const isBasic = profile?.membership_tier === 'basic'
  
  // Validar si la membresía Signature está expirada
  const isExpired = profile?.membership_expires_at 
    ? new Date(profile.membership_expires_at) <= new Date() 
    : true
  const isSignatureActive = isPremium && !isExpired

  // Tasas de bonificación basadas en la membresía
  const getBonusRate = (months: number) => {
    if (months === 1) return isSignatureActive ? 7 : 5
    if (months === 3) return isSignatureActive ? 10 : 8
    if (months === 6) return isSignatureActive ? 14 : 12
    if (months === 12) return isSignatureActive ? 17 : 15
    return 5
  }

  const bonusRate = getBonusRate(term)
  const numericAmount = parseFloat(amount) || 0
  const expectedBonus = Number((numericAmount * (bonusRate / 100) * (term / 12)).toFixed(2))

  const totalLocked = investments
    .filter(i => i.status === 'active')
    .reduce((sum, i) => sum + i.amount, 0)

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    
    if (numericAmount <= 0) {
      setMessage({ type: 'error', text: 'El monto a reservar debe ser mayor que cero.' })
      return
    }

    if (numericAmount > (profile.reward_balance || 0)) {
      setMessage({ type: 'error', text: 'No cuentas con suficiente Saldo Club disponible.' })
      return
    }

    setActionLoading(true)
    setMessage(null)

    try {
      const res = await createReservationAction(numericAmount, term)
      if (res.success) {
        setAmount('')
        setMessage({ type: 'success', text: 'Reserva de saldo confirmada con éxito. Tu saldo ha ingresado al programa de permanencia.' })
        router.refresh() // Refrescar los Server Props
      } else {
        setMessage({ type: 'error', text: res.error || 'Ocurrió un error inesperado.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de red al procesar la operación.' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleMature = async (invId: string) => {
    setMatureLoadingId(invId)
    setMessage(null)
    try {
      const res = await simulateReleaseAction(invId)
      if (res.success) {
        setMessage({ type: 'success', text: 'Saldo liberado con éxito. El saldo reservado y su bonificación correspondiente fueron acreditados a tu cuenta.' })
        router.refresh() // Refrescar los Server Props
      } else {
        setMessage({ type: 'error', text: res.error || 'No se pudo liberar el saldo.' })
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Error de red al procesar la liberación.' })
    } finally {
      setMatureLoadingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-8 border-b border-border-hairline">
        <div className="space-y-2">
          <h1 className="text-[36px] lg:text-[56px] font-display font-semibold tracking-tight text-text-primary leading-[1.1]">Mi Saldo Club</h1>
          <p className="text-[17px] text-text-secondary leading-relaxed max-w-xl">Monitorea tus recompensas y acumula saldo de bonificación por permanencia en tu cuenta.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3 text-xs font-mono uppercase tracking-wider">
          {isSignatureActive ? (
            <span className="bg-accent-signature-tint border border-accent-signature/25 text-accent-signature py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold">
              <Crown className="w-4 h-4" /> Signature (Bonificación +2% Preferencial)
            </span>
          ) : isBasic ? (
            <span className="bg-accent-acceso-tint border border-accent-acceso/25 text-accent-acceso py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4" /> Acceso (Bonificaciones Estándar)
            </span>
          ) : isPremium && isExpired ? (
            <Link href="/memberships" className="bg-accent-alert/5 border border-accent-alert/20 text-accent-alert hover:bg-accent-alert/10 py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors font-bold">
              <AlertCircle className="w-4 h-4" /> Membresía Signature Expirada (Renovar)
            </Link>
          ) : (
            <Link href="/memberships" className="bg-accent-alert/5 border border-accent-alert/20 text-accent-alert hover:bg-accent-alert/10 py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors font-bold">
              <AlertCircle className="w-4 h-4" /> Sin Membresía Activa (Suscribirse)
            </Link>
          )}
        </div>
      </div>

      {/* Banner de inhabilitación por regularización financiera */}
      <div className="bg-accent-alert/5 border border-accent-alert/20 text-accent-alert p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-accent-alert shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm uppercase tracking-wider">Programa de Permanencia Inhabilitado</h4>
            <p className="text-xs text-text-secondary leading-relaxed max-w-4xl">
              El funcionamiento de la bóveda, la creación de nuevas reservas (activos) y la generación de rendimientos asociados se encuentran suspendidos temporalmente. Esta medida se mantendrá hasta formalizar la documentación legal y los contratos necesarios para la operación del aparato financiero. Tu saldo promocional acumulado permanece seguro.
            </p>
          </div>
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
          <div className="bg-bg-surface border border-border-hairline p-6 rounded-2xl flex flex-col justify-between min-h-[160px] opacity-75">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Saldo Club Disponible</span>
              <Coins className="w-5 h-5 text-accent-acceso" />
            </div>
            <div>
              <div className="text-[32px] font-bold font-mono text-text-primary">${(profile?.reward_balance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
              <p className="text-[11px] text-text-secondary font-mono mt-2 uppercase tracking-wider">
                Módulo de reservas inactivo temporalmente
              </p>
            </div>
          </div>

          {/* Card Invertido */}
          <div className="bg-bg-surface border border-border-hairline p-6 rounded-2xl flex flex-col justify-between min-h-[160px] opacity-75">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Saldo Reservado por Permanencia</span>
              <Landmark className="w-5 h-5 text-accent-signature" />
            </div>
            <div>
              <div className="text-[32px] font-bold font-mono text-text-primary">${totalLocked.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
              <p className="text-[11px] text-text-secondary font-mono mt-2 uppercase tracking-wider">
                Acumulación congelada temporalmente
              </p>
            </div>
          </div>

        </div>

        {/* Columna Formulario Invertir */}
        <div className="lg:col-span-2 bg-bg-surface border border-border-hairline p-8 rounded-2xl relative overflow-hidden">
          {/* Overlay de inhabilitación por falta de contratos */}
          <div className="absolute inset-0 bg-bg-surface/85 backdrop-blur-[1.5px] flex flex-col items-center justify-center text-center p-8 z-20">
            <AlertCircle className="w-10 h-10 text-accent-alert mb-3" />
            <h3 className="font-display font-semibold text-text-primary text-[18px] uppercase tracking-wider">Aparato Financiero Inactivo</h3>
            <p className="text-xs text-text-secondary leading-relaxed max-w-sm mt-1">
              La reserva de saldo y generación de rendimientos adicionales se encuentran temporalmente suspendidas hasta formalizar los contratos financieros correspondientes.
            </p>
          </div>

          <h2 className="text-[22px] font-display font-semibold text-text-primary mb-6">Reservar Saldo por Permanencia</h2>
          
          {(!profile?.membership_tier || (isPremium && isExpired)) ? (
            <div className="border border-border-hairline rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-4 py-12">
              <AlertCircle className="w-8 h-8 text-accent-alert" />
              <div className="space-y-1">
                <p className="font-bold text-text-primary text-sm uppercase tracking-wider">Se requiere Membresía Activa</p>
                <p className="text-xs text-text-secondary leading-relaxed max-w-sm">Para poder reservar tu Saldo Club y acumular bonificaciones por permanencia necesitas una membresía activa y vigente (Acceso o Signature).</p>
              </div>
              <Link href="/memberships" className="bg-text-primary hover:bg-text-primary/95 text-bg-surface text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-xl transition-colors" tabIndex={-1}>
                Ver Membresías
              </Link>
            </div>
          ) : (
            <form onSubmit={handleInvest} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monto */}
                <div>
                  <label htmlFor="amount" className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">Monto a Reservar (Saldo Club)</label>
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
                      disabled={true}
                    />
                  </div>
                  <span className="text-[10px] text-text-secondary mt-1.5 block">
                    Disponible: <button type="button" disabled={true} onClick={() => setAmount(String(profile?.reward_balance || 0))} className="text-text-primary hover:text-accent-acceso font-mono font-bold underline cursor-not-allowed">${(profile?.reward_balance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</button>
                  </span>
                </div>

                {/* Plazo */}
                <div>
                  <label htmlFor="term" className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">Plazo de Permanencia</label>
                  <select
                    id="term"
                    value={term}
                    onChange={(e) => setTerm(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-bg-base border border-border-hairline focus:border-text-secondary rounded-xl outline-none font-bold text-text-primary transition-colors font-mono font-bold"
                    disabled={true}
                  >
                    <option value={1}>1 Mes (Bonificación: {getBonusRate(1)}% adicional)</option>
                    <option value={3}>3 Meses (Bonificación: {getBonusRate(3)}% adicional)</option>
                    <option value={6}>6 Meses (Bonificación: {getBonusRate(6)}% adicional)</option>
                    <option value={12}>12 Meses (Bonificación: {getBonusRate(12)}% adicional)</option>
                  </select>
                </div>
              </div>

              {/* Detalle de Rendimiento Simulado */}
              {numericAmount > 0 && (
                <div className="bg-bg-base rounded-xl p-4 border border-border-hairline grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-mono">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-text-secondary font-semibold uppercase block">Tasa de Bonificación</span>
                    <p className="text-[17px] font-bold text-text-primary">{bonusRate}%</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-text-secondary font-semibold uppercase block">Bonificación Estimada</span>
                    <p className="text-[17px] font-bold text-accent-acceso">+{expectedBonus.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-text-secondary font-semibold uppercase block">Monto al Finalizar</span>
                    <p className="text-[17px] font-bold text-text-primary">${(numericAmount + expectedBonus).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={true}
                className="w-full py-3.5 px-6 rounded-xl bg-text-primary hover:bg-text-primary/90 text-bg-surface font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40 flex items-center justify-center space-x-2 cursor-not-allowed"
              >
                {actionLoading ? (
                  <span>Creando Reserva...</span>
                ) : (
                  <>
                    <Landmark className="w-4 h-4" />
                    <span>Confirmar Reserva de Saldo</span>
                  </>
                )}
              </button>

              {/* Aviso Legal Obligatorio de Saldo Club */}
              <div className="mt-6 p-4 rounded-xl bg-bg-base border border-border-hairline text-[11px] text-text-secondary leading-relaxed text-left">
                <span className="font-bold text-text-primary block mb-1">Aviso Importante:</span>
                El Saldo Club es un beneficio promocional interno de Club de Marcas. No representa dinero electrónico, depósito bancario, inversión financiera, instrumento de ahorro, préstamo, valor bursátil ni producto regulado. Su uso está limitado a compras y beneficios dentro de Club de Marcas, conforme a los términos y condiciones vigentes.
              </div>
            </form>
          )}

        </div>

      </div>

      {/* Grid Inferior: Inversiones Activas e Historial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* INVERSIONES ACTIVAS */}
        <div className="space-y-6">
          <h2 className="text-[22px] font-display font-semibold text-text-primary flex items-center gap-2 border-b border-border-hairline pb-4">
            <Landmark className="w-5 h-5 text-text-primary" /> Reservas de Permanencia Activas
          </h2>

          {investments.length === 0 ? (
            <div className="text-center py-12 text-text-secondary border border-dashed border-border-hairline rounded-xl">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-border-hairline" />
              <p className="font-semibold text-sm">No tienes reservas vigentes</p>
              <p className="text-xs text-text-secondary mt-1">Tus saldos reservados bajo el programa de permanencia aparecerán aquí.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Overlay de activos congelados */}
              <div className="absolute inset-0 bg-bg-surface/85 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-6 z-10 rounded-xl">
                <AlertCircle className="w-8 h-8 text-accent-alert mb-2" />
                <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider">Activos Congelados</h4>
                <p className="text-[10px] text-text-secondary max-w-xs mt-1">
                  Las reservas de saldo y acreditación de rendimientos están congeladas temporalmente por falta de contratos correspondientes.
                </p>
              </div>

              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                {investments.map((inv) => {
                  const legacyInv = inv as unknown as { end_date?: string; annual_rate?: number; expected_yield?: number }
                  const releaseDate = inv.release_date || legacyInv.end_date || ''
                  const bonusRate = inv.bonus_rate || legacyInv.annual_rate || 5
                  const expectedBonus = inv.expected_bonus || legacyInv.expected_yield || 0
                  const isReleased = inv.status === 'released' || (inv.status as string) === 'completed'

                  const percentProgress = now > 0 ? Math.min(
                    100,
                    Math.max(
                      0,
                      ((now - new Date(inv.start_date).getTime()) /
                        (new Date(releaseDate).getTime() - new Date(inv.start_date).getTime())) *
                        100
                    )
                  ) : 0
                  
                  return (
                    <div key={inv.id} className="py-5 border-b border-border-hairline last:border-b-0 flex flex-col space-y-3 opacity-60">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Saldo Reservado</span>
                          <p className="text-[22px] font-bold font-mono text-text-primary">${inv.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Bonificación (+{bonusRate}%)</span>
                          <p className="text-[22px] font-bold font-mono text-accent-acceso">+{expectedBonus.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      {/* Progreso del Plazo */}
                      <div>
                        <div className="flex justify-between text-[10px] text-text-secondary font-mono mb-1">
                          <span>Inicio: {new Date(inv.start_date).toLocaleDateString('es-MX')}</span>
                          <span>Liberación: {new Date(releaseDate).toLocaleDateString('es-MX')}</span>
                        </div>
                        <div className="w-full bg-border-hairline h-1 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${isReleased ? 'bg-accent-acceso' : 'bg-accent-signature'}`} style={{ width: `${isReleased ? 100 : percentProgress}%` }}></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className={`text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-md ${
                          isReleased 
                            ? 'bg-accent-acceso-tint text-accent-acceso' 
                            : 'bg-accent-signature-tint text-accent-signature'
                        }`}>
                          {isReleased ? 'Liberado' : 'Reservado'}
                        </span>
                        
                        {!isReleased && (
                          <button
                            disabled={true}
                            className="bg-neutral-850 text-neutral-500 border border-neutral-800 text-[10px] font-mono font-bold uppercase tracking-wider py-1.5 px-3.5 rounded-lg opacity-50 cursor-not-allowed"
                          >
                            Inhabilitado
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
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
