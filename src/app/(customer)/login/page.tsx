import React from 'react'
import { redirect } from 'next/navigation'
import { DataService } from '@/utils/data-service'
import AuthForm from '@/components/AuthForm'

export default async function LoginPage() {
  // Si el usuario ya está autenticado, no hay necesidad de mostrar el login
  const user = await DataService.getCurrentUser()
  const profile = await DataService.getCurrentUserProfile()

  if (user) {
    if (profile?.role === 'admin') {
      redirect('/admin/dashboard')
    } else {
      redirect('/')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[70vh]">
      <div className="bg-pure-white p-8 rounded-3xl border border-gray-200 shadow-lg w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase bg-emerald/10 text-emerald-800 px-3 py-1 rounded-full font-black tracking-widest inline-block">
            Outlet Exclusivo
          </span>
          <h1 className="text-3xl font-black tracking-tight text-navy">
            CLUB DE MARCAS
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Ingresa a tu cuenta para obtener precios outlet de socio
          </p>
        </div>

        <AuthForm />
      </div>
    </div>
  )
}
