import React from 'react'
import { DataService } from '@/utils/data-service'
import AdminOrderManager from '@/components/AdminOrderManager'

export default async function AdminOrdersPage() {
  const orders = await DataService.getOrders()

  return <AdminOrderManager orders={orders} />
}
