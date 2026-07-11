'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Product } from '@/utils/data-service'

interface SearchBarProps {
  products: Product[]
}

export default function SearchBar({ products }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  // Filtrar sugerencias durante el renderizado (sin efectos)
  const suggestions = query.trim().length === 0
    ? []
    : products.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5) // Máximo 5 sugerencias

  // Cerrar sugerencias al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setIsOpen(false)
    router.push(`/?search=${encodeURIComponent(query.trim())}`)
  }

  const handleSuggestionClick = (product: Product) => {
    setQuery(product.title)
    setIsOpen(false)
    router.push(`/?search=${encodeURIComponent(product.title)}`)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSearch} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Busca marcas, tenis, relojes, lentes..."
          className="w-full bg-pure-white text-navy placeholder-gray-400 pl-4 pr-12 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy text-sm shadow-sm transition-all"
        />
        <div className="absolute right-3 flex items-center space-x-1">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
              }}
              className="text-gray-400 hover:text-navy p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="text-gray-400 hover:text-navy p-1.5 rounded-full hover:bg-gray-100"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Menú desplegable de sugerencias predictivas */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-pure-white rounded-lg border border-gray-200 shadow-lg z-50 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {suggestions.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(product)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                >
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy truncate">{product.title}</p>
                    <p className="text-xs text-gray-400">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-navy">
                      ${product.price.toLocaleString('es-MX')} MXN
                    </p>
                    {product.original_price && (
                      <p className="text-xs text-red-500 line-through">
                        ${product.original_price.toLocaleString('es-MX')}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
