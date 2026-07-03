'use client'

import React, { useState, useTransition } from 'react'
import { User, Phone, MapPin, Camera, Save, CheckCircle, AlertCircle, Loader2, Store, HelpCircle, Server } from 'lucide-react'
import { updateProfileAction, updateStoreSettingsAction } from '@/app/actions'
import type { Profile } from '@/utils/data-service'

interface AdminSettingsFormProps {
  adminProfile: Profile
  storeSettings: Record<string, string>
  isSupabaseConfigured: boolean
}

export default function AdminSettingsForm({ adminProfile, storeSettings, isSupabaseConfigured }: AdminSettingsFormProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'store'>('profile')

  // Estado Perfil
  const [fullName, setFullName] = useState(adminProfile.full_name || '')
  const [phone, setPhone] = useState(adminProfile.phone || '')
  const [avatarPreview, setAvatarPreview] = useState(adminProfile.avatar_url || '')
  
  // Estado Tienda
  const [storeName, setStoreName] = useState(storeSettings.store_name || 'Club de Marcas')
  const [whatsapp, setWhatsapp] = useState(storeSettings.support_whatsapp || '+52 (55) 1234-5678')
  const [shippingCost, setShippingCost] = useState(storeSettings.shipping_cost || '0')

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

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus(null)

    const formData = new FormData(e.currentTarget)
    formData.append('current_avatar_url', adminProfile.avatar_url || '')

    startTransition(async () => {
      const res = await updateProfileAction(null, formData)
      if (res?.error) {
        setStatus({ type: 'error', message: res.error })
      } else if (res?.success) {
        setStatus({ type: 'success', message: 'Tus datos de administrador fueron actualizados.' })
      }
    })
  }

  const handleStoreSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await updateStoreSettingsAction(null, formData)
      if (res?.error) {
        setStatus({ type: 'error', message: res.error })
      } else if (res?.success) {
        setStatus({ type: 'success', message: res.success })
      }
    })
  }

  return (
    <div className="bg-pure-white border border-gray-200 rounded-3xl shadow-lg overflow-hidden">
      {/* TABS HEADER */}
      <div className="flex border-b border-gray-200 bg-gray-50/50">
        <button
          type="button"
          onClick={() => { setActiveTab('profile'); setStatus(null); }}
          className={`flex-1 py-4 text-center font-bold text-sm tracking-wider uppercase transition-all border-b-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'text-emerald border-emerald bg-pure-white'
              : 'text-gray-400 border-transparent hover:text-navy'
          }`}
        >
          Mi Perfil Admin
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('store'); setStatus(null); }}
          className={`flex-1 py-4 text-center font-bold text-sm tracking-wider uppercase transition-all border-b-2 cursor-pointer ${
            activeTab === 'store'
              ? 'text-emerald border-emerald bg-pure-white'
              : 'text-gray-400 border-transparent hover:text-navy'
          }`}
        >
          Ajustes de la Tienda
        </button>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
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

        {/* TAB 1: PERFIL ADMIN */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* FOTO DE PERFIL */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald/20 shadow-md bg-light-grey/30 flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={fullName || 'Admin'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-14 h-14 text-gray-400" />
                  )}
                </div>
                <label
                  htmlFor="avatar_file"
                  className="absolute bottom-1 right-1 bg-emerald hover:bg-emerald-hover text-navy p-2.5 rounded-full cursor-pointer shadow-lg hover:scale-105 transition-all"
                  title="Cambiar fotografía"
                >
                  <Camera className="w-4 h-4 font-bold" />
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
            </div>

            <div className="space-y-4 text-left">
              {/* Nombre admin */}
              <div>
                <label htmlFor="full_name" className="block text-xs font-black uppercase text-navy/70 tracking-wider mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="full_name"
                    id="full_name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-light-grey/30 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald text-sm font-medium text-navy placeholder-gray-400"
                    placeholder="Ej. Administrador Principal"
                    required
                  />
                </div>
              </div>

              {/* Teléfono celular */}
              <div>
                <label htmlFor="phone" className="block text-xs font-black uppercase text-navy/70 tracking-wider mb-1.5">
                  Celular
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-light-grey/30 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald text-sm font-medium text-navy placeholder-gray-400"
                    placeholder="Ej. 5512345678"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center space-x-2 bg-navy hover:bg-navy-light text-pure-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-emerald" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 text-emerald" />
                  <span>Guardar Mi Perfil</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: AJUSTES TIENDA */}
        {activeTab === 'store' && (
          <form onSubmit={handleStoreSubmit} className="space-y-6">
            <div className="space-y-4 text-left">
              {/* Nombre de la tienda */}
              <div>
                <label htmlFor="store_name" className="block text-xs font-black uppercase text-navy/70 tracking-wider mb-1.5">
                  Nombre de la Tienda
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Store className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="store_name"
                    id="store_name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-light-grey/30 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald text-sm font-medium text-navy placeholder-gray-400"
                    placeholder="Ej. Club de Marcas"
                    required
                  />
                </div>
              </div>

              {/* WhatsApp de soporte */}
              <div>
                <label htmlFor="support_whatsapp" className="block text-xs font-black uppercase text-navy/70 tracking-wider mb-1.5">
                  WhatsApp de Soporte
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="support_whatsapp"
                    id="support_whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-light-grey/30 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald text-sm font-medium text-navy placeholder-gray-400"
                    placeholder="Ej. +52 (55) 1234-5678"
                    required
                  />
                </div>
              </div>

              {/* Costo de envío */}
              <div>
                <label htmlFor="shipping_cost" className="block text-xs font-black uppercase text-navy/70 tracking-wider mb-1.5">
                  Costo de Envío ($ MXN)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-bold text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="shipping_cost"
                    id="shipping_cost"
                    min="0"
                    step="any"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    className="block w-full pl-8 pr-4 py-3 bg-light-grey/30 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald text-sm font-medium text-navy placeholder-gray-400"
                    placeholder="0.00 (Gratuito)"
                    required
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Ingresa 0 para envío gratuito a nivel nacional.
                </p>
              </div>

              {/* Estado de Base de datos */}
              <div className="bg-light-grey/30 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Server className="w-5 h-5 text-navy" />
                  <div>
                    <div className="text-xs font-black uppercase text-navy leading-none mb-1">
                      Conexión a Base de Datos
                    </div>
                    <div className="text-[11px] text-gray-500 leading-none">
                      {isSupabaseConfigured ? 'Supabase Nube Activo' : 'Modo Simulación (Local)'}
                    </div>
                  </div>
                </div>
                <span className={`w-3 h-3 rounded-full ${isSupabaseConfigured ? 'bg-emerald shadow-lg shadow-emerald/30 animate-pulse' : 'bg-amber-500'}`}></span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center space-x-2 bg-navy hover:bg-navy-light text-pure-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-emerald" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 text-emerald" />
                  <span>Guardar Ajustes</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
