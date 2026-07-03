'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Info, X } from 'lucide-react'

export default function CookieBanner() {
  const [accepted, setAccepted] = useState<boolean | null>(null)

  useEffect(() => {
    const consent = localStorage.getItem('cookies_accepted')
    if (consent === 'true') {
      setAccepted(true)
    } else {
      setAccepted(false)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookies_accepted', 'true')
    setAccepted(true)
  }

  // Si aún no se ha verificado el localStorage o ya fue aceptado, no mostrar nada
  if (accepted === null || accepted === true) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slideUp">
      <div className="max-w-4xl mx-auto bg-navy text-pure-white p-5 rounded-2xl border border-navy-light/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Texto informativo */}
        <div className="flex items-start space-x-3.5 text-left flex-1">
          <div className="bg-emerald/10 p-2 rounded-xl text-emerald flex-shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald">
              Uso de Cookies Técnicas
            </h4>
            <p className="text-xs text-gray-300 leading-normal">
              Utilizamos cookies técnicas y funcionales para recordar tu inicio de sesión y gestionar el carrito de compras. Al continuar navegando, aceptas su uso de acuerdo con nuestro{' '}
              <Link
                href="/aviso-de-privacidad"
                className="underline hover:text-emerald font-semibold transition-colors"
              >
                Aviso de Privacidad
              </Link>{' '}
              y nuestros{' '}
              <Link
                href="/terminos-y-condiciones"
                className="underline hover:text-emerald font-semibold transition-colors"
              >
                Términos y Condiciones
              </Link>.
            </p>
          </div>
        </div>

        {/* Botón de Aceptar */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <button
            onClick={handleAccept}
            className="w-full md:w-auto bg-[#00E676] hover:bg-[#00c862] text-navy font-black text-xs uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-center"
          >
            Aceptar
          </button>
        </div>

      </div>
    </div>
  )
}
