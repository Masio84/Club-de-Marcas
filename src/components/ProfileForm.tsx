'use client'

import React, { useState, useTransition } from 'react'
import { User, Phone, MapPin, Camera, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { updateProfileAction } from '@/app/actions'
import type { Profile } from '@/utils/data-service'

interface ProfileFormProps {
  initialProfile: Profile
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialProfile.full_name || '')
  const [phone, setPhone] = useState(initialProfile.phone || '')
  const [address, setAddress] = useState(initialProfile.address || '')
  
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || '')
  const [avatarPreview, setAvatarPreview] = useState(initialProfile.avatar_url || '')
  
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus(null)

    const formData = new FormData(e.currentTarget)
    formData.append('current_avatar_url', avatarUrl)

    startTransition(async () => {
      const res = await updateProfileAction(null, formData)
      if (res?.error) {
        setStatus({ type: 'error', message: res.error })
      } else if (res?.success) {
        setStatus({ type: 'success', message: res.success })
        // Si el servidor devolvió una nueva url (en caso de subida real)
        // en este caso el action revalida la página por lo que los props se actualizarán,
        // pero podemos mantener el estado sincronizado
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. SECCIÓN DE AVATAR / FOTO */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald/20 shadow-md bg-navy-light/10 flex items-center justify-center">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={fullName || 'Avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <label
            htmlFor="avatar_file"
            className="absolute bottom-1 right-1 bg-emerald hover:bg-emerald-hover text-navy p-2.5 rounded-full cursor-pointer shadow-lg hover:scale-105 transition-all"
            title="Cambiar fotografía"
          >
            <Camera className="w-5 h-5 font-bold" />
            <input
              type="file"
              id="avatar_file"
              name="avatar_file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
          Foto del Socio Premium
        </p>
      </div>

      {/* MENSAJES DE ESTADO */}
      {status && (
        <div
          className={`p-4 rounded-xl border flex items-start space-x-3 text-sm animate-fade-in ${
            status.type === 'success'
              ? 'bg-emerald/10 border-emerald/30 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          )}
          <span className="font-semibold">{status.message}</span>
        </div>
      )}

      {/* CAMPOS DE TEXTO */}
      <div className="space-y-4 text-left">
        {/* Nombre completo */}
        <div>
          <label htmlFor="full_name" className="block text-xs font-black uppercase text-navy/70 tracking-wider mb-1.5">
            Nombre Completo
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="full_name"
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald bg-light-grey/30 text-sm font-medium text-navy placeholder-gray-400"
              placeholder="Ej. Juan Pérez Garza"
              required
            />
          </div>
        </div>

        {/* Teléfono Celular */}
        <div>
          <label htmlFor="phone" className="block text-xs font-black uppercase text-navy/70 tracking-wider mb-1.5">
            Teléfono Celular
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 h-5 text-gray-400" />
            </div>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald bg-light-grey/30 text-sm font-medium text-navy placeholder-gray-400"
              placeholder="Ej. 5512345678"
            />
          </div>
        </div>

        {/* Domicilio de entrega */}
        <div>
          <label htmlFor="address" className="block text-xs font-black uppercase text-navy/70 tracking-wider mb-1.5">
            Dirección de Envío
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute top-3 left-3 flex items-center pointer-events-none">
              <MapPin className="h-5 h-5 text-gray-400" />
            </div>
            <textarea
              name="address"
              id="address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald bg-light-grey/30 text-sm font-medium text-navy placeholder-gray-400 resize-none"
              placeholder="Ej. Calle Paseo de la Reforma #123, Col. Juárez, Cuauhtémoc, CP 06600, CDMX"
            />
          </div>
        </div>
      </div>

      {/* BOTÓN DE GUARDADO */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center space-x-2 bg-navy hover:bg-navy-light text-pure-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-emerald" />
            <span>Guardando cambios...</span>
          </>
        ) : (
          <>
            <Save className="w-5 h-5 text-emerald" />
            <span>Guardar Perfil de Socio</span>
          </>
        )}
      </button>
    </form>
  )
}
