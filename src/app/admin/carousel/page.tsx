import React from 'react'
import { DataService } from '@/utils/data-service'
import AdminCarouselManager from '@/components/AdminCarouselManager'

export const metadata = {
  title: 'Gestión de Carrusel | Panel de Control',
  description: 'Administra las diapositivas del carrusel de inicio, vigencias e imágenes.'
}

export default async function CarouselAdminPage() {
  const slides = await DataService.getCarouselSlides()

  return (
    <div className="space-y-6">
      <AdminCarouselManager initialSlides={slides} />
    </div>
  )
}
