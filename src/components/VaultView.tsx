'use client'

import React, { useState, useEffect } from 'react'
import { Landmark, ArrowUpRight, ArrowDownRight, Coins, Calendar, Sparkles, Clock, AlertCircle } from 'lucide-react'
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
      setMessage({ type: 'error', text: 'El monto a invertir debe ser mayor que cero.' })
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
        setMessage({ type: 'success', text: '¡Excelente! Tu inversión ha sido congelada y puesta a generar rendimiento.' })
        router.refresh() // Refrescar los Server Props
      } else {
        setMessage({ type: 'error', text: res.error || 'Ocurrió un error inesperado.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error de red al procesar la inversión.' })
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
        setMessage({ type: 'success', text: '¡Plazo finalizado! El capital y su rendimiento han sido abonados a tu saldo disponible.' })
        router.refresh() // Refrescar los Server Props
      } else {
        setMessage({ type: 'error', text: res.error || 'No se pudo liquidar la inversión.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error de red al procesar la liquidación.' })
    } finally {
      setMatureLoadingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 pb-6 border-b border-gray-200">
        <div>
          <span className="text-xs uppercase bg-emerald/20 text-emerald font-black tracking-widest px-3 py-1 rounded-full">
            Bóveda de Rendimiento
          </span>
          <h1 className="text-3xl font-black text-navy mt-3">Mi Bóveda de Activos Club</h1>
          <p className="text-sm text-gray-500 mt-1">Monitorea tus retornos y pon a trabajar tu capital acumulado.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <span className="text-xs text-gray-400 font-semibold uppercase">Membresía Activa:</span>
          {isPremium ? (
            <span className="bg-emerald text-navy text-xs font-black uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center">
              👑 Signature (Tasas +2% Preferenciales)
            </span>
          ) : isBasic ? (
            <span className="bg-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider py-1.5 px-3 rounded-lg">
              🛡️ Acceso (Tasas Estándar)
            </span>
          ) : (
            <Link href="/memberships" className="bg-amber-100 border border-amber-300 text-amber-800 hover:bg-amber-200 text-xs font-black uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center transition-all">
              ⚠️ Sin Membresía (Suscribirse ahora)
            </Link>
          )}
        </div>
      </div>

      {/* Alertas */}
      {message && (
        <div className={`mb-8 p-4 rounded-xl border text-sm font-semibold flex items-center justify-between shadow-sm animate-fade-in ${
          message.type === 'success' ? 'bg-emerald/10 border-emerald/30 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600 transition-colors ml-4">✕</button>
        </div>
      )}

      {/* Grid Superior: Balances e Inversión */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Columna Balances (Tarjetas) */}
        <div className="flex flex-col space-y-6">
          
          {/* Card Disponible */}
          <div className="bg-gradient-to-br from-navy to-navy-light p-6 rounded-3xl text-pure-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[180px]">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald/15 blur-2xl"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Activos Club Disponibles</span>
              <Coins className="w-5 h-5 text-emerald" />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black tracking-tight">${(profile?.reward_balance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
              <p className="text-[10px] text-emerald font-semibold mt-2 flex items-center">
                <Sparkles className="w-3 h-3 mr-1 fill-emerald" /> Listos para ser invertidos a plazo fijo
              </p>
            </div>
          </div>

          {/* Card Invertido */}
          <div className="bg-pure-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between min-h-[180px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Saldo en Inversión Activa</span>
              <Landmark className="w-5 h-5 text-navy" />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-navy tracking-tight">${totalLocked.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
              <p className="text-[10px] text-gray-400 font-semibold mt-2 flex items-center">
                <Clock className="w-3 h-3 mr-1" /> Generando intereses compuesto
              </p>
            </div>
          </div>

        </div>

        {/* Columna Formulario Invertir */}
        <div className="lg:col-span-2 bg-pure-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-black text-navy mb-4">Iniciar Nueva Inversión</h2>
          
          {(!profile?.membership_tier) ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm flex flex-col items-center justify-center text-center space-y-4 h-[75%]">
              <AlertCircle className="w-8 h-8 text-amber-500" />
              <div>
                <p className="font-bold text-amber-800">Se requiere Membresía Activa</p>
                <p className="text-xs text-amber-600 mt-1">Para poder invertir tus Activos Club y generar rendimiento a plazos necesitas una membresía activa (Acceso o Signature).</p>
              </div>
              <Link href="/memberships" className="bg-navy hover:bg-navy-light text-pure-white text-xs font-black uppercase tracking-wider py-2.5 px-6 rounded-xl transition-all">
                Ver Membresías
              </Link>
            </div>
          ) : (
            <form onSubmit={handleInvest} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monto */}
                <div>
                  <label htmlFor="amount" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Monto a Invertir (Activos Club)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3.5 bg-slate-50 border border-gray-200 focus:border-navy focus:bg-pure-white rounded-2xl outline-none font-bold text-navy transition-all"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Disponible: <button type="button" onClick={() => setAmount(String(profile?.reward_balance || 0))} className="text-navy hover:text-emerald font-bold underline">${(profile?.reward_balance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</button>
                  </span>
                </div>

                {/* Plazo */}
                <div>
                  <label htmlFor="term" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Plazo de Retención</label>
                  <select
                    id="term"
                    value={term}
                    onChange={(e) => setTerm(parseInt(e.target.value))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 focus:border-navy focus:bg-pure-white rounded-2xl outline-none font-bold text-navy transition-all"
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
                <div className="bg-slate-50 rounded-2xl p-4 border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Tasa Anualizada</span>
                    <p className="text-lg font-black text-navy">{annualRate}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Rendimiento Estimado</span>
                    <p className="text-lg font-black text-emerald">+${expectedYield.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Retorno al Vencer</span>
                    <p className="text-lg font-black text-navy">${(numericAmount + expectedYield).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={actionLoading || numericAmount <= 0 || numericAmount > (profile.reward_balance || 0)}
                className="w-full py-4 px-6 rounded-2xl bg-navy hover:bg-navy-light text-pure-white font-black text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-40 flex items-center justify-center space-x-2"
              >
                {actionLoading ? (
                  <span>Creando Inversión...</span>
                ) : (
                  <>
                    <Landmark className="w-4 h-4" />
                    <span>Confirmar e Iniciar Inversión</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>

      {/* Grid Inferior: Inversiones Activas e Historial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* INVERSIONES ACTIVAS */}
        <div className="bg-pure-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-black text-navy mb-6 flex items-center">
              <Landmark className="w-5 h-5 mr-2 text-navy" /> Inversiones Vigentes
            </h2>

            {investments.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-semibold text-sm">No tienes inversiones vigentes</p>
                <p className="text-xs text-gray-400 mt-1">Tus inversiones a plazos aparecerán aquí.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {investments.map((inv) => {
                  const percentProgress = Math.min(100, Math.max(0, ((Date.now() - new Date(inv.start_date).getTime()) / (new Date(inv.end_date).getTime() - new Date(inv.start_date).getTime())) * 100))
                  
                  return (
                    <div key={inv.id} className="p-4 bg-slate-50 border border-gray-200 rounded-2xl flex flex-col space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Monto Invertido</span>
                          <p className="text-lg font-black text-navy">${inv.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Rendimiento (+{inv.annual_rate}%)</span>
                          <p className="text-lg font-black text-emerald">+${inv.expected_yield.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      {/* Progreso del Plazo */}
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                          <span>Inicio: {new Date(inv.start_date).toLocaleDateString('es-MX')}</span>
                          <span>Vence: {new Date(inv.end_date).toLocaleDateString('es-MX')}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${inv.status === 'completed' ? 'bg-emerald' : 'bg-navy'}`} style={{ width: `${inv.status === 'completed' ? 100 : percentProgress}%` }}></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                          inv.status === 'completed' 
                            ? 'bg-emerald/10 text-emerald' 
                            : 'bg-navy/10 text-navy'
                        }`}>
                          {inv.status === 'completed' ? 'Completado' : 'Activo'}
                        </span>
                        
                        {inv.status === 'active' && (
                          <button
                            onClick={() => handleMature(inv.id)}
                            disabled={matureLoadingId !== null}
                            className="bg-emerald text-navy text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded hover:bg-emerald-light transition-all disabled:opacity-50"
                          >
                            {matureLoadingId === inv.id ? 'Abonando...' : '⚡ Liquidar Plazo (Prueba)'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* HISTORIAL DE TRANSACCIONES */}
        <div className="bg-pure-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-black text-navy mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-navy" /> Historial de Activos
            </h2>

            {transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Coins className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-semibold text-sm">Sin transacciones registradas</p>
                <p className="text-xs text-gray-400 mt-1">Tus movimientos de saldo se reflejarán aquí.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {transactions.map((tx) => {
                  const isPositive = tx.amount > 0
                  
                  return (
                    <div key={tx.id} className="p-3.5 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${isPositive ? 'bg-emerald/10 text-emerald' : 'bg-navy/5 text-navy'}`}>
                          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-navy leading-tight">{tx.description}</p>
                          <span className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleString('es-MX')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-extrabold ${isPositive ? 'text-emerald' : 'text-navy'}`}>
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
    </div>
  )
}
