'use client'

import React, { useState, useEffect } from 'react'

interface NavbarBalanceProps {
  initialBalance: number
}

export default function NavbarBalance({ initialBalance }: NavbarBalanceProps) {
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    if (initialBalance <= 0) {
      requestAnimationFrame(() => setBalance(0))
      return
    }

    const duration = 1200 // 1.2s
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing out cuadrático
      const easeProgress = progress * (2 - progress)
      const currentVal = easeProgress * initialBalance
      
      setBalance(currentVal)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setBalance(initialBalance)
      }
    }

    requestAnimationFrame(animate)
  }, [initialBalance])

  return (
    <span className="text-xs font-mono font-bold text-accent-acceso">
      ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  )
}
