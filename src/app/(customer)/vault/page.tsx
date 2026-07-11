import React from 'react'
import { redirect } from 'next/navigation'
import { DataService } from '@/utils/data-service'
import VaultView from '@/components/VaultView'

export const metadata = {
  title: 'Saldo Club - Club de Marcas',
  description: 'Gestiona tu Saldo Club y programa de permanencia.'
}

export default async function VaultPage() {
  const user = await DataService.getCurrentUser()
  if (!user) {
    redirect('/login?redirectTo=/vault')
  }

  const profile = await DataService.getCurrentUserProfile()
  const investments = await DataService.getActiveInvestments()
  const transactions = await DataService.getRewardTransactions()

  return (
    <VaultView 
      initialProfile={profile}
      initialInvestments={investments}
      initialTransactions={transactions}
    />
  )
}
