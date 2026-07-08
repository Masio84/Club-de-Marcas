import React from 'react'

interface YieldChipProps {
  rate: number
  tier: 'basic' | 'premium'
}

export default function YieldChip({ rate, tier }: YieldChipProps) {
  const isPremium = tier === 'premium'
  
  // Clases específicas de color según la membresía (fondos tintados claros + texto oscuro)
  const colorClass = isPremium 
    ? 'text-accent-signature bg-accent-signature-tint border border-accent-signature/25' 
    : 'text-accent-acceso bg-accent-acceso-tint border border-accent-acceso/25'

  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-mono text-[13px] font-bold tracking-tight ${colorClass}`}>
      ▲ {rate.toFixed(1)}%
    </span>
  )
}
