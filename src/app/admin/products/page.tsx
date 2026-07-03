import React from 'react'
import { DataService } from '@/utils/data-service'
import AdminProductManager from '@/components/AdminProductManager'

export default async function AdminProductsPage() {
  const products = await DataService.getProducts()

  return <AdminProductManager products={products} />
}
