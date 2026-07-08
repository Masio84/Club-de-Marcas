import React from 'react'
import { DataService } from '@/utils/data-service'
import MembershipsView from '@/components/MembershipsView'

export const metadata = {
  title: 'Membresías Club de Marcas',
  description: 'Adquiere y gestiona tu membresía premium.'
}

export default async function MembershipsPage() {
  const profile = await DataService.getCurrentUserProfile()

  return (
    <MembershipsView initialProfile={profile} />
  )
}
