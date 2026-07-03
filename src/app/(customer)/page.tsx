import React from 'react'
import Link from 'next/link'
import { Watch, Sparkles, ShoppingBag, Flame, Star, Glasses, Footprints, RotateCcw } from 'lucide-react'
import { DataService } from '@/utils/data-service'
import HeroCarousel from '@/components/HeroCarousel'
import AddToCartButton from '@/components/AddToCartButton'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const category = resolvedParams.category as string | undefined
  const search = resolvedParams.search as string | undefined

  // Obtener productos filtrados
  let allProducts = await DataService.getProducts()
  
  if (category) {
    allProducts = allProducts.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    )
  }

  if (search) {
    allProducts = allProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    )
  }

  // Dividir productos para las secciones
  // Ofertas Relámpago: Tienen precio original (descuento)
  const flashDeals = allProducts.filter((p) => p.original_price && p.original_price > p.price)
  // Más Vendidos: Todos o los de mayor stock/inventario
  const bestSellers = allProducts.filter((p) => p.inventory > 10)

  // Categorías con sus respectivos iconos de Lucide
  const categoriesList = [
    { name: 'Tenis', slug: 'Tenis', icon: Footprints },
    { name: 'Relojes', slug: 'Relojes', icon: Watch },
    { name: 'Gorras', slug: 'Gorras', icon: ShoppingBag }, // Simula gorra
    { name: 'Lentes', slug: 'Lentes', icon: Glasses },
    { name: 'Bolsas', slug: 'Bolsas', icon: ShoppingBag },
    { name: 'Cuidado Personal', slug: 'Cuidado Personal', icon: Sparkles },
  ]

  return (
    <div className="space-y-10">
      {/* 1. CARRUSEL HERO BANNER */}
      {!category && !search && <HeroCarousel />}

      {/* Título de Resultados de búsqueda / Categoría */}
      {(category || search) && (
        <div className="bg-pure-white p-6 rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm mb-6">
          <div>
            <h2 className="text-xl font-bold text-navy">
              {category ? `Categoría: ${category}` : `Resultados para "${search}"`}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Se encontraron {allProducts.length} productos coincidentes
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center space-x-1.5 text-xs font-semibold text-navy hover:text-emerald transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Limpiar filtros</span>
          </Link>
        </div>
      )}

      {/* 2. BURBUJAS DE CATEGORÍAS RÁPIDAS (Estilo Mercado Libre) */}
      <section className="space-y-4">
        <h3 className="text-sm font-black text-navy uppercase tracking-wider">Categorías Destacadas</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {categoriesList.map((cat) => {
            const IconComponent = cat.icon
            const isActive = category?.toLowerCase() === cat.slug.toLowerCase()

            return (
              <Link
                key={cat.slug}
                href={`/?category=${cat.slug}`}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-pure-white border transition-all duration-200 group hover:-translate-y-1 shadow-sm ${
                  isActive
                    ? 'border-emerald ring-2 ring-emerald/20 bg-emerald/5'
                    : 'border-gray-200 hover:border-navy'
                }`}
              >
                <div className={`p-3 rounded-full mb-2.5 transition-colors ${
                  isActive ? 'bg-emerald text-navy' : 'bg-gray-100 text-navy group-hover:bg-navy group-hover:text-pure-white'
                }`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-center truncate w-full text-navy">
                  {cat.name}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 3. OFERTAS RELÁMPAGO (Flash Deals) */}
      {flashDeals.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-red-500 fill-red-500 animate-bounce" />
              <h3 className="text-lg font-black text-navy uppercase tracking-wider">Ofertas Relámpago</h3>
            </div>
            <div className="bg-navy text-pure-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald animate-ping"></span>
              <span>Finaliza en: 02h 45m</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {flashDeals.map((product) => {
              const discount = product.original_price
                ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                : 0

              return (
                <div
                  key={product.id}
                  className="bg-pure-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col group hover:shadow-lg transition-shadow relative"
                >
                  {/* Etiqueta de descuento */}
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-emerald text-navy text-[10px] font-black px-2 py-0.5 rounded-full z-10 shadow-sm">
                      -{discount}%
                    </span>
                  )}

                  {/* Imagen */}
                  <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Detalles */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                        {product.category}
                      </span>
                      {product.rating_avg !== undefined && product.rating_count !== undefined && product.rating_count > 0 && (
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <div className="flex items-center text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 fill-current ${
                                  i < Math.round(product.rating_avg || 0) ? 'text-amber-400' : 'text-gray-200'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold">
                            {product.rating_avg.toFixed(1)} ({product.rating_count})
                          </span>
                        </div>
                      )}
                      <h4 className="font-bold text-navy text-sm line-clamp-2 min-h-[40px] group-hover:text-emerald-hover transition-colors">
                        {product.title}
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {/* Precios */}
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-base font-black text-navy">
                            ${product.price.toLocaleString('es-MX')}
                          </span>
                          {product.original_price && (
                            <span className="text-xs text-gray-400 line-through">
                              ${product.original_price.toLocaleString('es-MX')}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-semibold text-emerald uppercase block">
                          Envío gratis 📦
                        </span>
                      </div>

                      {/* Botón comprar */}
                      <AddToCartButton productId={product.id} inventory={product.inventory} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 4. MÁS VENDIDOS (Best Sellers) */}
      {bestSellers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <h3 className="text-lg font-black text-navy uppercase tracking-wider">Los Más Vendidos</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bestSellers.map((product) => {
              const discount = product.original_price && product.original_price > product.price
                ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                : 0

              return (
                <div
                  key={product.id}
                  className="bg-pure-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col group hover:shadow-lg transition-shadow relative"
                >
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-emerald text-navy text-[10px] font-black px-2 py-0.5 rounded-full z-10 shadow-sm">
                      -{discount}%
                    </span>
                  )}

                  <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                        {product.category}
                      </span>
                      {product.rating_avg !== undefined && product.rating_count !== undefined && product.rating_count > 0 && (
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <div className="flex items-center text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 fill-current ${
                                  i < Math.round(product.rating_avg || 0) ? 'text-amber-400' : 'text-gray-200'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold">
                            {product.rating_avg.toFixed(1)} ({product.rating_count})
                          </span>
                        </div>
                      )}
                      <h4 className="font-bold text-navy text-sm line-clamp-2 min-h-[40px]">
                        {product.title}
                      </h4>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-base font-black text-navy">
                            ${product.price.toLocaleString('es-MX')}
                          </span>
                          {discount > 0 && product.original_price && (
                            <span className="text-xs text-gray-400 line-through">
                              ${product.original_price.toLocaleString('es-MX')}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-semibold text-emerald uppercase block">
                          Envío gratis 📦
                        </span>
                      </div>

                      <AddToCartButton productId={product.id} inventory={product.inventory} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Si no hay resultados de búsqueda */}
      {allProducts.length === 0 && (
        <div className="text-center py-20 bg-pure-white rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <p className="text-gray-400 text-lg">No encontramos productos que coincidan con tu búsqueda.</p>
          <Link
            href="/"
            className="inline-block bg-navy hover:bg-navy-light text-pure-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Ver todos los productos
          </Link>
        </div>
      )}
    </div>
  )
}
