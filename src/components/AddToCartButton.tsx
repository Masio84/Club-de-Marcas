'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ShoppingCart, Check } from 'lucide-react'
import { addToCartAction } from '@/app/actions'

interface AddToCartButtonProps {
  productId: string
  inventory: number
}

export default function AddToCartButton({ productId, inventory }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevenir que el clic navegue si está en un card con Link
    if (inventory <= 0 || loading) return

    setLoading(true)
    try {
      const res = await addToCartAction(productId, 1)
      if (res.success) {
        setSuccess(true)
        router.refresh() // Refrescar el server component para actualizar el Navbar
        
        // Regresar al estado original después de 2 segundos
        setTimeout(() => {
          setSuccess(false)
        }, 2000)
      } else {
        alert('Debes iniciar sesión para agregar productos al carrito.')
        router.push('/login')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (inventory <= 0) {
    return (
      <button
        disabled
        className="w-full bg-gray-200 text-gray-400 font-bold py-2 px-4 rounded-lg text-xs uppercase cursor-not-allowed"
      >
        Agotado
      </button>
    )
  }

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className={`w-full font-bold py-2 px-4 rounded-lg text-xs uppercase flex items-center justify-center space-x-1.5 transition-all duration-200 ${
        success
          ? 'bg-emerald text-navy'
          : 'bg-navy hover:bg-navy-light text-pure-white hover:scale-[1.02] shadow-sm'
      }`}
    >
      {success ? (
        <>
          <Check className="w-4 h-4" />
          <span>¡Agregado!</span>
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" />
          <span>{loading ? 'Agregando...' : 'Agregar al carrito'}</span>
        </>
      )}
    </button>
  )
}
