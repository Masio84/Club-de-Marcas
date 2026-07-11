'use client'

import React, { useState, useEffect } from 'react'

export default function HistoricalYieldPanel() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const end = 17
    const duration = 1200 // 1.2s
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing out cuadrático
      const easeProgress = progress * (2 - progress)
      const currentVal = Math.round(easeProgress * end)
      
      setCount(currentVal)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [])

  return (
    <div className="bg-bg-dark-panel text-bg-base p-6 rounded-[20px] shadow-2xl flex flex-col justify-between min-h-[360px] border border-neutral-800 transition-all duration-300">
      {/* Encabezado del Panel */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-850">
        <div>
          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Bonificación Histórica</span>
          <h4 className="text-[17px] font-display text-bg-base font-semibold">Bonificación por Permanencia</h4>
        </div>
        <span className="text-[13px] font-mono text-accent-signature bg-accent-signature-tint/10 px-2.5 py-0.5 rounded-md border border-accent-signature/20">
          Máx +17%
        </span>
      </div>

      {/* Número Protagonista Animado */}
      <div className="py-4 space-y-0.5 text-left">
        <div className="text-[64px] font-bold font-mono text-accent-signature leading-none tracking-tight">
          {count}%
        </div>
        <p className="text-[12px] text-text-secondary uppercase tracking-wider font-medium">
          Bonificación máxima adicional
        </p>
      </div>

      {/* Gráfico SVG Curva Compacto */}
      <div className="relative py-2 flex-1 flex items-center justify-center">
        <svg className="w-full h-28 overflow-visible" viewBox="0 0 300 100" fill="none">
          {/* Guías punteadas horizontales */}
          <line x1="0" y1="80" x2="300" y2="80" stroke="#1E2530" strokeDasharray="3 3" />
          <line x1="0" y1="50" x2="300" y2="50" stroke="#1E2530" strokeDasharray="3 3" />
          <line x1="0" y1="20" x2="300" y2="20" stroke="#1E2530" strokeDasharray="3 3" />

          {/* Curva Acceso (Jade) */}
          <path
            d="M 10 80 Q 150 55 290 28"
            stroke="var(--accent-acceso)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Curva Signature (Dorado) */}
          <path
            d="M 10 65 Q 150 40 290 12"
            stroke="var(--accent-signature)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Puntos y etiquetas */}
          <circle cx="290" cy="28" r="4.5" fill="var(--accent-acceso)" />
          <text x="230" y="44" fill="var(--accent-acceso)" className="font-mono text-[9px] font-bold">15% Acceso</text>

          <circle cx="290" cy="12" r="4.5" fill="var(--accent-signature)" />
          <text x="205" y="6" fill="var(--accent-signature)" className="font-mono text-[9px] font-bold">17% Signature</text>

          {/* Eje X */}
          <text x="10" y="94" fill="#5B6472" className="font-mono text-[9px]">1m</text>
          <text x="100" y="94" fill="#5B6472" className="font-mono text-[9px]">3m</text>
          <text x="190" y="94" fill="#5B6472" className="font-mono text-[9px]">6m</text>
          <text x="280" y="94" fill="#5B6472" className="font-mono text-[9px]">12m</text>
        </svg>
      </div>

      {/* Leyendas Ley de Colores */}
      <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] text-text-secondary font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-accent-acceso rounded-full"></span> Socio Acceso
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-accent-signature rounded-full"></span> Socio Signature
        </span>
      </div>
    </div>
  )
}
