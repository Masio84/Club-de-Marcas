'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'

interface Slide {
  title: string
  subtitle: string
  tag: string
  image: string
  link: string
  cta: string
  color: string
}

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  const slides: Slide[] = [
    {
      title: 'CALZADO PREMIUM CLUB',
      subtitle: 'Hasta 50% de descuento en Nike, Adidas, Puma y Jordan. Envío gratis garantizado.',
      tag: '🔥 Lo Más Vendido',
      image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&auto=format&fit=crop&q=80',
      link: '/?category=Calzado',
      cta: 'Ver Calzado en Oferta',
      color: 'from-navy via-navy/95 to-transparent'
    },
    {
      title: 'ROPA DE DISEÑADOR Y MARCAS',
      subtitle: 'Essentials, The North Face, Moncler y Balenciaga. Descubre prendas de alta costura con descuentos exclusivos de socio.',
      tag: '💎 Exclusividad',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80',
      link: '/?category=Ropa',
      cta: 'Explorar Ropa',
      color: 'from-black via-black/90 to-transparent'
    },
    {
      title: 'COLECCIONES DE TEMPORADA',
      subtitle: 'Chamarras, hoodies, playeras y jeans con descuentos exclusivos y autenticidad 100% garantizada.',
      tag: '✨ Nuevos Arribos',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
      link: '/?category=Ropa',
      cta: 'Ver Ropa y Abrigos',
      color: 'from-navy-light via-navy-light/95 to-transparent'
    },
    {
      title: 'BENEFICIOS VIP SIGNATURE',
      subtitle: 'Obtén hasta 15% de Cashback en cada compra, envíos express gratis y acceso exclusivo a productos Prestige de edición limitada.',
      tag: '👑 Membresía Elite',
      image: 'https://images.unsplash.com/photo-1441984969893-c534e9749e48?w=1600&auto=format&fit=crop&q=80',
      link: '/memberships',
      cta: 'Unirse a Signature',
      color: 'from-[#1F160A] via-[#1F160A]/95 to-transparent'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  const next = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  const prev = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  return (
    <div className="relative w-full h-[300px] md:h-[450px] bg-navy rounded-2xl overflow-hidden shadow-lg border border-navy-light mb-8 group">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Imagen de fondo */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[6000ms] ease-out scale-105"
            style={{ 
              backgroundImage: `url(${slide.image})`,
              transform: index === current ? 'scale(1)' : 'scale(1.05)'
            }}
          />
          {/* Degradado premium para legibilidad de textos */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} z-10`} />

          {/* Información */}
          <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-6 sm:px-12 md:px-20 z-20 max-w-xl text-pure-white">
            <span className="inline-flex items-center space-x-1 bg-emerald text-navy text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-4 w-fit">
              <Sparkles className="w-3 h-3" />
              <span>{slide.tag}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight mb-3">
              {slide.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-300 mb-6 font-medium">
              {slide.subtitle}
            </p>
            <Link
              href={slide.link}
              className="inline-flex items-center justify-center bg-emerald hover:bg-emerald-hover text-navy font-bold px-6 py-3 rounded-lg text-sm transition-all shadow-md w-fit hover:scale-105"
            >
              {slide.cta}
            </Link>
          </div>
        </div>
      ))}

      {/* Flechas de navegación */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-navy/60 hover:bg-navy text-pure-white p-2 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-navy/60 hover:bg-navy text-pure-white p-2 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === current ? 'bg-emerald w-6' : 'bg-pure-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
