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
      title: 'OUTLET DE TENIS PREMIUM',
      subtitle: 'Hasta 50% de descuento en Nike, Adidas y Puma. Modelos seleccionados con envío gratis.',
      tag: '🔥 Oferta del Mes',
      image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&auto=format&fit=crop&q=80',
      link: '/?category=Tenis',
      cta: 'Ver Tenis en Oferta',
      color: 'from-navy via-navy/95 to-transparent'
    },
    {
      title: 'RELOJES AUTOMÁTICOS Y G-SHOCK',
      subtitle: 'Precisión y estilo indestructible. 12 Meses Sin Intereses con tarjetas participantes.',
      tag: '💎 Exclusividad',
      image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=1600&auto=format&fit=crop&q=80',
      link: '/?category=Relojes',
      cta: 'Explorar Relojes',
      color: 'from-black via-black/90 to-transparent'
    },
    {
      title: 'ACCESORIOS DE TEMPORADA',
      subtitle: 'Lentes Ray-Ban y Gorras New Era originales. Dale el toque final a tu estilo diario.',
      tag: '✨ Nuevos Arribos',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80',
      link: '/?category=Lentes',
      cta: 'Ver Accesorios',
      color: 'from-navy-light via-navy-light/95 to-transparent'
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
