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

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8 min-h-[75vh]">
      <div className="bg-pure-white p-8 rounded-3xl border border-gray-200 shadow-lg w-full max-w-xl text-center space-y-6">
        
        {/* Encabezado */}
        <div className="space-y-2">
          <span className="text-xs uppercase bg-emerald/10 text-emerald-800 px-3 py-1 rounded-full font-black tracking-widest inline-block">
            Membresía Activa
          </span>
          <h1 className="text-3xl font-black tracking-tight text-navy uppercase">
            Mi Perfil de Socio
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Mantén tus datos actualizados para recibir tus compras sin contratiempos.
          </p>
        </div>

        <hr className="border-gray-200" />

        {/* Formulario */}
        <ProfileForm initialProfile={profile} />
        
      </div>
    </div>
  )
}
