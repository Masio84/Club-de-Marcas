'use client'

import React, { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Key, Mail, UserPlus, ArrowRight, ShieldCheck, User } from 'lucide-react'
import { signInAction, signUpAction } from '@/app/actions'

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, startTransition] = useTransition()
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      if (isLogin) {
        const res = await signInAction(null, formData)
        if (res && res.error) {
          setError(res.error)
        } else {
          // Exitoso, el router redirecciona en la acción o lo forzamos aquí por seguridad
          router.push(redirectTo)
          router.refresh()
        }
      } else {
        const res = await signUpAction(null, formData)
        if (res && res.error) {
          setError(res.error)
        } else if (res && res.success) {
          setSuccess(res.success)
          // Si no se requiere confirmación por correo, iniciar sesión e ir a la página
          setTimeout(() => {
            router.push(redirectTo)
            router.refresh()
          }, 1500)
        }
      }
    })
  }

  // Credenciales de prueba rápida
  const handleQuickLogin = (email: string) => {
    const form = document.getElementById('auth-form') as HTMLFormElement
    if (!form) return
    
    const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement
    const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement
    
    if (emailInput && passwordInput) {
      emailInput.value = email
      passwordInput.value = '123456' // Contraseña genérica para simulación
      
      // Enviar formulario
      const submitEvent = new Event('submit', { cancelable: true, bubbles: true })
      form.dispatchEvent(submitEvent)
    }
  }

  return (
    <div className="space-y-6 w-full max-w-md">
      {/* Selector superior */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => {
            setIsLogin(true)
            setError('')
            setSuccess('')
          }}
          className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-colors uppercase tracking-wider ${
            isLogin
              ? 'border-navy text-navy font-black'
              : 'border-transparent text-gray-400 hover:text-navy'
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          onClick={() => {
            setIsLogin(false)
            setError('')
            setSuccess('')
          }}
          className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-colors uppercase tracking-wider ${
            !isLogin
              ? 'border-navy text-navy font-black'
              : 'border-transparent text-gray-400 hover:text-navy'
          }`}
        >
          Registrarse
        </button>
      </div>

      {/* Formulario */}
      <form id="auth-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Correo */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-navy uppercase tracking-wider block">
            Correo Electrónico
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              name="email"
              required
              placeholder="nombre@ejemplo.com"
              className="w-full text-sm bg-gray-50 text-navy placeholder-gray-450 pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
          </div>
        </div>

        {/* Campo Contraseña */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-navy uppercase tracking-wider block">
            Contraseña
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Key className="w-4 h-4" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full text-sm bg-gray-50 text-navy placeholder-gray-450 pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-navy"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirmar Contraseña (solo registro) */}
        {!isLogin && (
          <div className="space-y-1.5 animate-fadeIn">
            <label className="text-xs font-black text-navy uppercase tracking-wider block">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Key className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required={!isLogin}
                placeholder="••••••••"
                className="w-full text-sm bg-gray-50 text-navy placeholder-gray-450 pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>
          </div>
        )}

        {/* Checkboxes Legales para Registro */}
        {!isLogin && (
          <div className="space-y-3 pt-1.5 text-left animate-fadeIn">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms_accepted"
                name="terms_accepted"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 text-emerald focus:ring-emerald border-gray-300 rounded mt-0.5 cursor-pointer accent-emerald"
                required
              />
              <label htmlFor="terms_accepted" className="ml-2 text-xs text-navy/70 leading-normal">
                Acepto los{' '}
                <Link
                  href="/terminos-y-condiciones"
                  target="_blank"
                  className="underline text-navy font-bold hover:text-emerald"
                >
                  Términos y Condiciones
                </Link>{' '}
                de servicio.
              </label>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="privacy_accepted"
                name="privacy_accepted"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="w-4 h-4 text-emerald focus:ring-emerald border-gray-300 rounded mt-0.5 cursor-pointer accent-emerald"
                required
              />
              <label htmlFor="privacy_accepted" className="ml-2 text-xs text-navy/70 leading-normal">
                He leído y acepto el{' '}
                <Link
                  href="/aviso-de-privacidad"
                  target="_blank"
                  className="underline text-navy font-bold hover:text-emerald"
                >
                  Aviso de Privacidad
                </Link>.
              </label>
            </div>
          </div>
        )}

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg font-semibold">
            {error}
          </div>
        )}

        {/* Mensaje de Éxito */}
        {success && (
          <div className="bg-emerald/10 border border-emerald/30 text-emerald-800 text-xs p-3 rounded-lg font-semibold animate-pulse">
            {success}
          </div>
        )}

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={isPending || (!isLogin && (!termsAccepted || !privacyAccepted))}
          className="w-full bg-emerald hover:bg-emerald-hover text-navy font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLogin ? (
            <>
              <span>{isPending ? 'Ingresando...' : 'Iniciar Sesión'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>{isPending ? 'Creando cuenta...' : 'Crear Cuenta Socio'}</span>
              <UserPlus className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* CREDENCIALES DE PRUEBA RÁPIDA (Solo visible si Supabase no está configurado, o para facilitar testing) */}
      {!(!!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3.5 shadow-inner">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-navy uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald" />
            <span>Acceso Rápido para Pruebas (Maqueta)</span>
          </div>
          <p className="text-[11px] text-gray-500">
            Haz clic en uno de los roles para auto-rellenar y probar la navegación por roles de forma instantánea.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@clubdemarcas.mx')}
              disabled={isPending}
              className="bg-navy hover:bg-navy-light text-pure-white text-xs font-bold py-2 px-3 rounded-lg border border-navy-light flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald" />
              <span>Entrar como Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('cliente@clubdemarcas.mx')}
              disabled={isPending}
              className="bg-pure-white hover:bg-gray-100 text-navy text-xs font-bold py-2 px-3 rounded-lg border border-gray-200 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-gray-500" />
              <span>Entrar como Cliente</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
