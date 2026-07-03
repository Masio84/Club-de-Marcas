import React from 'react'
import { redirect } from 'next/navigation'
import { DataService } from '@/utils/data-service'
import ProfileForm from '@/components/ProfileForm'

export const metadata = {
  title: 'Mi Perfil de Socio | Club de Marcas',
  description: 'Gestiona tu perfil de socio, dirección de envío y datos personales.'
}

export default async function ProfilePage() {
  const user = await DataService.getCurrentUser()
  
  if (!user) {
    redirect('/login?redirectTo=/profile')
  }

  const profile = await DataService.getCurrentUserProfile()

  if (!profile) {
    // Si el usuario existe en auth pero no en profiles (ej: error en DB o trigger),
    // creamos un perfil temporal para evitar fallos de renderizado
    redirect('/')
  }

  const orders = await DataService.getOrders()
  const userReviews = await DataService.getUserReviews()

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8 min-h-[75vh]">
      <div className="bg-pure-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-lg w-full max-w-4xl space-y-6">
        
        {/* Encabezado */}
        <div className="space-y-2 text-center">
          <span className="text-xs uppercase bg-emerald/10 text-emerald-850 px-3 py-1 rounded-full font-black tracking-widest inline-block">
            Membresía Activa
          </span>
          <h1 className="text-3xl font-black tracking-tight text-navy uppercase">
            Panel de Control del Socio
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Gestiona tus datos de envío, consulta tu historial de compras y califica tus productos favoritos.
          </p>
        </div>

        <hr className="border-gray-150" />

        {/* Formulario / Dashboard */}
        <ProfileForm 
          initialProfile={profile} 
          initialOrders={orders} 
          initialReviews={userReviews} 
        />
        
      </div>
    </div>
  )
}
