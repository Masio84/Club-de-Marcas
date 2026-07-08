import React from 'react'
import { redirect } from 'next/navigation'
import { DataService } from '@/utils/data-service'
import CartView from '@/components/CartView'

export default async function CartPage() {
  const user = await DataService.getCurrentUser()

  if (!user) {
    // Redirigir a login si no está autenticado, pasando el destino
    redirect('/login?redirectTo=/cart')
  }

  const cartItems = await DataService.getCart()
  const profile = await DataService.getCurrentUserProfile()

  return (
    <div className="max-w-7xl mx-auto py-4">
      <CartView initialItems={cartItems} userEmail={user.email || ''} profile={profile} />
    </div>
  )
}
