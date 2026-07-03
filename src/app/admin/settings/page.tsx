import React from 'react'
import { redirect } from 'next/navigation'
import { DataService } from '@/utils/data-service'
import { isSupabaseConfigured } from '@/utils/supabase/client'
import AdminSettingsForm from '@/components/AdminSettingsForm'

export const metadata = {
  title: 'Ajustes y Configuración | Panel de Administración',
  description: 'Gestiona la tienda, envíos y perfil de administrador.'
}

export default async function AdminSettingsPage() {
  const user = await DataService.getCurrentUser()
  if (!user) {
    redirect('/login?redirectTo=/admin/settings')
  }

  const profile = await DataService.getCurrentUserProfile()
  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const storeSettings = await DataService.getStoreSettings()
  const dbConfigured = isSupabaseConfigured()

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-black text-navy uppercase tracking-tight">
          Ajustes y Configuración
        </h1>
        <p className="text-xs text-gray-500">
          Personaliza tu perfil administrativo y administra los parámetros generales de tu tienda en línea.
        </p>
      </div>

      <div className="max-w-2xl">
        <AdminSettingsForm
          adminProfile={profile}
          storeSettings={storeSettings}
          isSupabaseConfigured={dbConfigured}
        />
      </div>
    </div>
  )
}
