import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Watch, Sparkles, ShoppingBag, Flame, Star, Glasses, Footprints, RotateCcw, Lock, ArrowRight, TrendingUp, ShieldCheck, Truck, Award, Shirt } from 'lucide-react'
import { DataService } from '@/utils/data-service'
import AddToCartButton from '@/components/AddToCartButton'
import YieldChip from '@/components/YieldChip'
import HeroCarousel from '@/components/HeroCarousel'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const category = resolvedParams.category as string | undefined
  const search = resolvedParams.search as string | undefined

  // Obtener sesión y perfil para personalizar Saldo Club y restricciones
  const user = await DataService.getCurrentUser()
  const profile = await DataService.getCurrentUserProfile()

  const isPremium = profile?.membership_tier === 'premium'
  const isExpired = profile?.membership_expires_at 
    ? new Date(profile.membership_expires_at) <= new Date() 
    : true
  const isSignatureActive = isPremium && !isExpired

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

  // Obtener publicaciones del carrusel dinámicas
  const carouselSlides = await DataService.getCarouselSlides(true)

  // Dividir productos para las secciones
  const flashDeals = allProducts.filter((p) => p.original_price && p.original_price > p.price)
  const bestSellers = allProducts.filter((p) => p.inventory > 10)

  // Categorías con sus respectivos iconos de Lucide
  const categoriesList = [
    { name: 'Ropa', slug: 'Ropa', icon: Shirt },
    { name: 'Calzado', slug: 'Calzado', icon: Footprints },
  ]

  return (
    <div className="space-y-24 my-10">
      {/* 1. HERO PRINCIPAL CARRUSEL + PROPUESTAS DE VALOR (ESTILO EDITORIAL BOUTIQUE DE CLUB) */}
      {!category && !search && (
        <div className="space-y-8">
          <HeroCarousel initialSlides={carouselSlides} />
          
          {/* BARRA DE PROPUESTA DE VALOR / GANCHO COMERCIAL */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 md:p-8 bg-bg-surface rounded-2xl border border-border-hairline shadow-sm relative z-20">
            <div className="flex items-center space-x-3.5 text-left">
              <div className="p-3 bg-accent-signature-tint/15 border border-accent-signature/10 rounded-xl text-accent-signature flex-shrink-0">
                <Award className="w-5 h-5 text-accent-signature" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-text-primary">100% Originales</h4>
                <p className="text-xs text-text-secondary mt-0.5">Marcas de diseñador certificadas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3.5 text-left">
              <div className="p-3 bg-accent-acceso-tint/15 border border-accent-acceso/10 rounded-xl text-accent-acceso flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-text-primary">Envío Express Gratis</h4>
                <p className="text-xs text-text-secondary mt-0.5">Asegurado en Aguascalientes</p>
              </div>
            </div>
            <div className="flex items-center space-x-3.5 text-left">
              <div className="p-3 bg-accent-signature-tint/15 border border-accent-signature/10 rounded-xl text-accent-signature flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-text-primary">Hasta 17% Cashback</h4>
                <p className="text-xs text-text-secondary mt-0.5">Saldo Club para futuras compras</p>
              </div>
            </div>
            <div className="flex items-center space-x-3.5 text-left">
              <div className="p-3 bg-accent-acceso-tint/15 border border-accent-acceso/10 rounded-xl text-accent-acceso flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-text-primary">Devoluciones Fáciles</h4>
                <p className="text-xs text-text-secondary mt-0.5">Sin complicaciones en 14 días</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resultados de Búsqueda Cabecera */}
      {(category || search) && (
        <div className="bg-bg-surface p-6 rounded-2xl border border-border-hairline flex items-center justify-between shadow-sm mb-6">
          <div>
            <h2 className="text-[28px] font-display font-semibold text-text-primary">
              {category ? `Categoría: ${category}` : `Resultados para "${search}"`}
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Se encontraron {allProducts.length} productos coincidentes
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-text-primary hover:text-accent-acceso transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Limpiar filtros</span>
          </Link>
        </div>
      )}

      {/* 3. MARCAS DESTACADAS (HORIZONTAL RAIL - SCROLL-X - EDITORIAL STYLE) */}
      <section className="space-y-6">
        <h2 className="text-[28px] font-display font-semibold text-text-primary tracking-tight">Marcas de Prestigio</h2>
        <div className="flex overflow-x-auto scrollbar-none pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 items-center">
          {[
            { name: 'Nike Sportswear', category: 'Calzado & Moda Sport', slug: 'Calzado' },
            { name: 'Adidas Premium', category: 'Calzado Deportivo Premium', slug: 'Calzado' },
            { name: 'Essentials FOG', category: 'Ropa Streetwear de Lujo', slug: 'Ropa' },
            { name: 'The North Face', category: 'Ropa Térmica y Outdoor', slug: 'Ropa' },
            { name: 'Balenciaga', category: 'Alta Costura y Moda Urbana', slug: 'Ropa' },
            { name: 'Moncler', category: 'Chamarras y Plumones Premium', slug: 'Ropa' }
          ].map((brand) => (
            <Link
              key={brand.name}
              href={`/?category=${brand.slug}`}
              className="flex-shrink-0 text-left space-y-1.5 pr-8 mr-8 border-r border-border-hairline last:border-r-0 last:pr-0 last:mr-0 transition-opacity hover:opacity-85"
            >
              <h4 className="font-display font-semibold text-text-primary text-[18px] leading-tight">
                {brand.name}
              </h4>
              <p className="text-[14px] text-text-secondary">
                {brand.category}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. OFERTAS RELÁMPAGO (DARK CONTRAST SECTION - SCROLL RHYTHM) */}
      {flashDeals.length > 0 && (
        <section className="bg-bg-dark-panel text-bg-base p-8 lg:p-12 rounded-[24px] border border-neutral-850 space-y-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-accent-signature animate-pulse" />
              <h2 className="text-[28px] font-display font-semibold text-bg-base tracking-tight">Ofertas Relámpago</h2>
            </div>
            <div className="bg-[#1E2530] border border-neutral-800 text-bg-base/90 text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-alert animate-ping"></span>
              <span>TERMINAN EN: 02H 45M</span>
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
                  className="bg-[#1E2530] rounded-2xl border border-neutral-800/80 overflow-hidden flex flex-col group hover:scale-[1.02] hover:shadow-2xl transition-all duration-150 ease-out relative"
                >
                  {/* Etiqueta de descuento */}
                  {discount > 0 && (
                    <span className="absolute top-4 left-4 bg-[#12161F] border border-neutral-800 text-bg-base text-[13px] font-mono font-bold px-2.5 py-0.5 rounded-md z-10 shadow-sm">
                      -{discount}%
                    </span>
                  )}

                  {/* Yield Chip de Retorno */}
                  <span className="absolute top-4 right-4 z-10 group-hover:scale-[1.08] transition-transform duration-300 ease-in-out">
                    <YieldChip 
                      rate={isSignatureActive ? (product.return_rate_premium ?? 10.0) : (product.return_rate_basic ?? 2.0)} 
                      tier={isSignatureActive ? 'premium' : 'basic'} 
                    />
                  </span>
 
                  {/* Imagen */}
                  <div className="relative aspect-square w-full bg-[#12161F] overflow-hidden border-b border-neutral-800/60">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">
                        No Image
                      </div>
                    )}
                  </div>
 
                  {/* Detalles */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-1.5 text-left">
                      <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider block">
                        {product.category}
                      </span>
                      {product.rating_avg !== undefined && product.rating_count !== undefined && product.rating_count > 0 && (
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <div className="flex items-center text-accent-signature">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 fill-current ${
                                  i < Math.round(product.rating_avg || 0) ? 'text-accent-signature' : 'text-neutral-700'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-text-secondary font-mono font-bold">
                            {product.rating_avg.toFixed(1)} ({product.rating_count})
                          </span>
                        </div>
                      )}
                      <h4 className="font-display font-semibold text-bg-base text-[17px] leading-snug line-clamp-2 min-h-[48px] group-hover:text-accent-signature transition-colors">
                        {product.title}
                      </h4>
                    </div>
 
                    <div className="space-y-4">
                      {/* Precios */}
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-[22px] font-bold font-mono text-bg-base">
                            ${product.price.toLocaleString('es-MX')}
                          </span>
                          {product.original_price && (
                            <span className="text-xs font-mono text-text-secondary line-through">
                              ${product.original_price.toLocaleString('es-MX')}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-accent-acceso uppercase tracking-wider block mt-0.5">
                          Envío gratis
                        </span>
                      </div>
 
                      {/* Retorno Activo Info */}
                      <div className="bg-[#12161F] p-3 rounded-xl border border-neutral-800 text-left space-y-1.5">
                        <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Bonificación Club</span>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] text-text-secondary">Acumulas:</span>
                          <span className="font-mono font-bold text-accent-acceso">
                            ${(product.price * (isSignatureActive ? (product.return_rate_premium || 10.0) : (product.return_rate_basic || 2.0)) / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {!isSignatureActive && (
                          <div className="text-[10px] text-text-secondary border-t border-neutral-800/40 pt-1.5 flex justify-between">
                            <span>Con Signature:</span>
                            <span className="font-mono font-semibold text-accent-signature">
                              ${(product.price * (product.return_rate_premium || 10.0) / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>
 
                      {/* Botón comprar / Restricción */}
                      {product.is_prestige && !isSignatureActive ? (
                        <Link
                          href="/memberships"
                          className="w-full py-3 px-4 rounded-xl text-[11px] font-bold uppercase tracking-wider text-accent-alert bg-accent-alert/5 border border-accent-alert/20 hover:bg-accent-alert/10 transition-colors flex items-center justify-center space-x-1.5"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Exclusivo Signature</span>
                        </Link>
                      ) : (
                        <AddToCartButton productId={product.id} inventory={product.inventory} />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 5. LOS MÁS VENDIDOS */}
      {bestSellers.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-accent-signature" />
            <h2 className="text-[28px] font-display font-semibold text-text-primary tracking-tight">Los Más Vendidos</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bestSellers.map((product) => {
              const discount = product.original_price && product.original_price > product.price
                ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                : 0

              return (
                <div
                  key={product.id}
                  className="bg-bg-surface rounded-2xl border border-border-hairline overflow-hidden flex flex-col group hover:scale-[1.02] hover:shadow-lg transition-all duration-150 ease-out relative"
                >
                  {/* Etiqueta de descuento */}
                  {discount > 0 && (
                    <span className="absolute top-4 left-4 bg-bg-surface border border-border-hairline text-text-primary text-[13px] font-mono font-bold px-2.5 py-0.5 rounded-md z-10 shadow-sm">
                      -{discount}%
                    </span>
                  )}

                  {/* Yield Chip de Retorno */}
                  <span className="absolute top-4 right-4 z-10 group-hover:scale-[1.08] transition-transform duration-300 ease-in-out">
                    <YieldChip 
                      rate={isSignatureActive ? (product.return_rate_premium ?? 10.0) : (product.return_rate_basic ?? 2.0)} 
                      tier={isSignatureActive ? 'premium' : 'basic'} 
                    />
                  </span>

                  {/* Imagen */}
                  <div className="relative aspect-square w-full bg-bg-base overflow-hidden border-b border-border-hairline/60">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Detalles */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-1.5 text-left">
                      <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider block">
                        {product.category}
                      </span>
                      {product.rating_avg !== undefined && product.rating_count !== undefined && product.rating_count > 0 && (
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <div className="flex items-center text-accent-signature">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 fill-current ${
                                  i < Math.round(product.rating_avg || 0) ? 'text-accent-signature' : 'text-border-hairline'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-text-secondary font-mono font-bold">
                            {product.rating_avg.toFixed(1)} ({product.rating_count})
                          </span>
                        </div>
                      )}
                      <h4 className="font-display font-semibold text-text-primary text-[17px] leading-snug line-clamp-2 min-h-[48px] group-hover:text-accent-signature transition-colors">
                        {product.title}
                      </h4>
                    </div>

                    <div className="space-y-4">
                      {/* Precios */}
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-[22px] font-bold font-mono text-text-primary">
                            ${product.price.toLocaleString('es-MX')}
                          </span>
                          {discount > 0 && product.original_price && (
                            <span className="text-xs font-mono text-text-secondary line-through">
                              ${product.original_price.toLocaleString('es-MX')}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-accent-acceso uppercase tracking-wider block mt-0.5">
                          Envío gratis
                        </span>
                      </div>

                      {/* Retorno Activo Info */}
                      <div className="bg-bg-base p-3 rounded-xl border border-border-hairline text-left space-y-1.5">
                        <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Bonificación Club</span>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[11px] text-text-secondary">Acumulas:</span>
                          <span className="font-mono font-bold text-accent-acceso">
                            ${(product.price * (isSignatureActive ? (product.return_rate_premium || 10.0) : (product.return_rate_basic || 2.0)) / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {!isSignatureActive && (
                          <div className="text-[10px] text-text-secondary border-t border-border-hairline/40 pt-1.5 flex justify-between">
                            <span>Con Signature:</span>
                            <span className="font-mono font-semibold text-accent-signature">
                              ${(product.price * (product.return_rate_premium || 10.0) / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Botón comprar / Restricción */}
                      {product.is_prestige && !isSignatureActive ? (
                        <Link
                          href="/memberships"
                          className="w-full py-3 px-4 rounded-xl text-[11px] font-bold uppercase tracking-wider text-accent-alert bg-accent-alert/5 border border-accent-alert/20 hover:bg-accent-alert/10 transition-colors flex items-center justify-center space-x-1.5"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Exclusivo Signature</span>
                        </Link>
                      ) : (
                        <AddToCartButton productId={product.id} inventory={product.inventory} />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Si no hay resultados */}
      {allProducts.length === 0 && (
        <div className="text-center py-20 bg-bg-surface rounded-3xl border border-border-hairline space-y-4">
          <p className="text-text-secondary text-sm">No encontramos productos que coincidan con tu búsqueda.</p>
          <Link
            href="/"
            className="inline-block bg-bg-base hover:bg-bg-base/80 border border-border-hairline text-text-primary text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-xl transition-all"
          >
            Ver todos los productos
          </Link>
        </div>
      )}
    </div>
  )
}
