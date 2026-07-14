'use client'

import React, { useState, useTransition } from 'react'
import { Plus, Edit2, Trash2, Calendar, ShieldAlert, Sparkles, Check, X, Clock, Image as ImageIcon, Link as LinkIcon, AlertCircle } from 'lucide-react'
import { saveCarouselSlideAction, deleteCarouselSlideAction } from '@/app/actions'
import { type CarouselSlide } from '@/utils/data-service'

interface AdminCarouselManagerProps {
  initialSlides: CarouselSlide[]
}

const GRADIENTS = [
  { name: 'Azul Premium (Navy)', value: 'from-navy via-navy/95 to-transparent' },
  { name: 'Negro Profundo', value: 'from-black via-black/90 to-transparent' },
  { name: 'Azul Claro', value: 'from-navy-light via-navy-light/95 to-transparent' },
  { name: 'Bronce VIP', value: 'from-[#1F160A] via-[#1F160A]/95 to-transparent' },
  { name: 'Verde Esmeralda', value: 'from-[#022c22] via-[#022c22]/95 to-transparent' }
]

export default function AdminCarouselManager({ initialSlides }: AdminCarouselManagerProps) {
  const [slides, setSlides] = useState<CarouselSlide[]>(initialSlides)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null)
  
  // Transition para Server Actions
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Estados del Formulario
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [tag, setTag] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [link, setLink] = useState('')
  const [cta, setCta] = useState('Ver Detalles')
  const [color, setColor] = useState(GRADIENTS[0].value)
  const [isActive, setIsActive] = useState(true)
  const [publishedAt, setPublishedAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  const openAddModal = () => {
    setEditingSlide(null)
    setTitle('')
    setSubtitle('')
    setTag('✨ Destacado')
    setImageUrl('')
    setLink('/?category=')
    setCta('Ver Detalles')
    setColor(GRADIENTS[0].value)
    setIsActive(true)
    
    // Default a la hora local
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    setPublishedAt(now.toISOString().slice(0, 16))
    setExpiresAt('')
    setImageFile(null)
    
    setError(null)
    setSuccess(null)
    setIsModalOpen(true)
  }

  const openEditModal = (slide: CarouselSlide) => {
    setEditingSlide(slide)
    setTitle(slide.title)
    setSubtitle(slide.subtitle || '')
    setTag(slide.tag || '')
    setImageUrl(slide.image_url)
    setLink(slide.link)
    setCta(slide.cta)
    setColor(slide.color)
    setIsActive(slide.is_active)
    
    // Formatear fechas para input datetime-local (YYYY-MM-DDTHH:MM)
    if (slide.published_at) {
      const pubDate = new Date(slide.published_at)
      pubDate.setMinutes(pubDate.getMinutes() - pubDate.getTimezoneOffset())
      setPublishedAt(pubDate.toISOString().slice(0, 16))
    } else {
      setPublishedAt('')
    }
    
    if (slide.expires_at) {
      const expDate = new Date(slide.expires_at)
      expDate.setMinutes(expDate.getMinutes() - expDate.getTimezoneOffset())
      setExpiresAt(expDate.toISOString().slice(0, 16))
    } else {
      setExpiresAt('')
    }
    
    setImageFile(null)
    setError(null)
    setSuccess(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    if (editingSlide) {
      formData.append('id', editingSlide.id)
    }
    formData.append('title', title)
    formData.append('subtitle', subtitle)
    formData.append('tag', tag)
    formData.append('link', link)
    formData.append('cta', cta)
    formData.append('color', color)
    formData.append('is_active', isActive ? 'true' : 'false')
    
    // Enviar fechas ISO válidas
    formData.append('published_at', new Date(publishedAt).toISOString())
    if (expiresAt) {
      formData.append('expires_at', new Date(expiresAt).toISOString())
    }

    if (imageFile) {
      formData.append('image_file', imageFile)
    } else {
      formData.append('image_url', imageUrl)
    }

    startTransition(async () => {
      const res = await saveCarouselSlideAction(formData)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(res.success || 'Guardado correctamente.')
        // Recargar datos locales simulados o recargar página para refrescar datos actualizados del server
        setTimeout(() => {
          setIsModalOpen(false)
          window.location.reload()
        }, 1000)
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta diapositiva? Esto borrará permanentemente la imagen asociada del Storage.')) return

    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const res = await deleteCarouselSlideAction(id)
      if (res.error) {
        setError(res.error)
      } else {
        setSlides(prev => prev.filter(s => s.id !== id))
        setSuccess('Publicación eliminada correctamente.')
      }
    })
  }

  // Determinar estatus de vigencia y depuración
  const getSlideStatus = (slide: CarouselSlide) => {
    if (!slide.is_active) {
      return { label: 'Inactivo', badgeClass: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
    const now = new Date().getTime()
    const pubTime = new Date(slide.published_at).getTime()
    const expTime = slide.expires_at ? new Date(slide.expires_at).getTime() : null

    if (pubTime > now) {
      return { label: 'Programado', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' }
    }
    if (expTime && expTime < now) {
      return { label: 'Expirado', badgeClass: 'bg-red-50 text-red-800 border-red-200' }
    }
    return { label: 'Activo', badgeClass: 'bg-emerald/10 text-emerald-800 border-emerald/20' }
  }

  return (
    <div className="space-y-6">
      {/* Mensajes de feedback general */}
      {success && (
        <div className="bg-emerald/10 border border-emerald/20 text-emerald-800 p-4 rounded-xl text-xs font-bold animate-fadeIn">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-accent-alert/5 border border-accent-alert/20 text-accent-alert p-4 rounded-xl text-xs font-bold animate-fadeIn">
          {error}
        </div>
      )}

      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-border-hairline pb-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-text-primary">Carrusel de Inicio</h2>
          <p className="text-xs text-text-secondary mt-1">Gestiona las diapositivas promocionales en la página de inicio, calendariza publicaciones y vigencias.</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={isPending}
          className="bg-accent-signature hover:bg-accent-signature/95 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase flex items-center space-x-1.5 transition-all shadow-md hover:scale-[1.02] cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Agregar Publicación</span>
        </button>
      </div>

      {/* Tabla/Listado de Slides */}
      <div className="bg-bg-surface rounded-2xl border border-border-hairline shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-bg-base text-text-secondary border-b border-border-hairline uppercase font-mono tracking-wider">
                <th className="p-4 font-semibold">Imagen</th>
                <th className="p-4 font-semibold">Contenido Principal</th>
                <th className="p-4 font-semibold">Enlace / Botón</th>
                <th className="p-4 font-semibold">Vigencia</th>
                <th className="p-4 font-semibold">Estatus</th>
                <th className="p-4 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-text-primary">
              {slides.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-secondary font-medium font-mono">
                    No hay publicaciones configuradas en el carrusel. Se muestran los valores por defecto del sistema.
                  </td>
                </tr>
              ) : (
                slides.map((slide) => {
                  const status = getSlideStatus(slide)
                  return (
                    <tr key={slide.id} className="hover:bg-bg-base/30 transition-colors">
                      <td className="p-4">
                        <div className="w-20 h-12 bg-gray-100 rounded-lg overflow-hidden border border-border-hairline flex-shrink-0 relative">
                          <img
                            src={slide.image_url}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-4 space-y-1 max-w-xs">
                        <div className="flex items-center space-x-1.5">
                          {slide.tag && (
                            <span className="bg-gray-100 border border-gray-200 text-gray-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                              {slide.tag}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm truncate" title={slide.title}>{slide.title}</h4>
                        <p className="text-[11px] text-text-secondary line-clamp-1" title={slide.subtitle}>{slide.subtitle}</p>
                      </td>
                      <td className="p-4 space-y-1">
                        <div className="flex items-center space-x-1 text-text-secondary">
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span className="font-mono text-[10px] truncate max-w-[120px]">{slide.link}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-text-primary">
                          <span className="bg-accent-signature/10 border border-accent-signature/20 text-accent-signature text-[10px] font-bold px-2 py-0.5 rounded">
                            {slide.cta}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 space-y-1 text-text-secondary">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pub: {new Date(slide.published_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[10px]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Vence: {slide.expires_at ? new Date(slide.expires_at).toLocaleDateString() : 'Indefinido'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1.5">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${status.badgeClass}`}>
                            {status.label}
                          </span>
                          {slide.image_cleaned_up && (
                            <div className="flex items-center space-x-1 text-[9px] text-accent-alert font-semibold uppercase">
                              <AlertCircle className="w-3 h-3 flex-shrink-0" />
                              <span>Imagen Autodepurada</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(slide)}
                            disabled={isPending}
                            className="p-2 hover:bg-gray-100 hover:text-navy rounded-lg text-text-secondary transition-colors cursor-pointer"
                            title="Editar Diapositiva"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(slide.id)}
                            disabled={isPending}
                            className="p-2 hover:bg-red-50 hover:text-red-650 rounded-lg text-text-secondary transition-colors cursor-pointer"
                            title="Eliminar Diapositiva"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL / FORMULARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-xl overflow-hidden shadow-2xl animate-scaleUp max-h-[90vh] flex flex-col">
            {/* Cabecera Modal */}
            <div className="p-6 border-b border-gray-150 flex items-center justify-between bg-bg-base/20">
              <h3 className="text-lg font-display font-semibold text-text-primary">
                {editingSlide ? 'Editar Publicación' : 'Nueva Publicación de Carrusel'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Título y Subtítulo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider block">
                    Título Principal
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-bg-base border border-border-hairline rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-signature/20 focus:border-accent-signature text-sm font-medium text-text-primary"
                    placeholder="Ej. CALZADO PREMIUM CLUB"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider block">
                    Tag Destacado / Badge
                  </label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-bg-base border border-border-hairline rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-signature/20 focus:border-accent-signature text-sm font-medium text-text-primary"
                    placeholder="Ej. 🔥 Lo Más Vendido"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider block">
                  Subtítulo / Descripción Corta
                </label>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={2}
                  className="block w-full px-3.5 py-2.5 bg-bg-base border border-border-hairline rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-signature/20 focus:border-accent-signature text-sm font-medium text-text-primary"
                  placeholder="Escribe una breve descripción del banner o descuento promocional..."
                />
              </div>

              {/* Imagen (Subida física de archivo o URL) */}
              <div className="space-y-2 border border-dashed border-gray-250 p-4 rounded-2xl bg-bg-base/10">
                <label className="text-[10px] font-mono font-bold text-text-primary uppercase tracking-wider block">
                  Imagen de la Diapositiva
                </label>
                
                <div className="space-y-3">
                  {/* File Input */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-text-secondary font-medium">Subir archivo de imagen (Recomendado):</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setImageFile(e.target.files[0])
                        }
                      }}
                      className="block w-full text-xs text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-accent-signature/10 file:text-accent-signature file:cursor-pointer hover:file:bg-accent-signature/20"
                    />
                  </div>

                  {/* Divider */}
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-gray-250"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-gray-400 uppercase font-mono">O bien</span>
                    <div className="flex-grow border-t border-gray-250"></div>
                  </div>

                  {/* URL Input */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-text-secondary font-medium">Ingresar URL directa de la imagen:</span>
                    <div className="relative">
                      <ImageIcon className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value)
                          setImageFile(null) // Resetear file si ingresa URL
                        }}
                        className="block w-full pl-9 pr-3.5 py-2.5 bg-bg-base border border-border-hairline rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-signature/20 focus:border-accent-signature text-sm font-medium text-text-primary"
                        placeholder="https://images.unsplash.com/photo-..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enlace y CTA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider block">
                    Ruta / Enlace de Destino
                  </label>
                  <input
                    type="text"
                    required
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-bg-base border border-border-hairline rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-signature/20 focus:border-accent-signature text-sm font-medium text-text-primary font-mono"
                    placeholder="Ej. /?category=Calzado o /memberships"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider block">
                    Texto del Botón (CTA)
                  </label>
                  <input
                    type="text"
                    required
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-bg-base border border-border-hairline rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-signature/20 focus:border-accent-signature text-sm font-medium text-text-primary"
                    placeholder="Ej. Ver Calzado en Oferta"
                  />
                </div>
              </div>

              {/* Degradado Overlay */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider block">
                  Degradado de Superposición (Overlay)
                </label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-bg-base border border-border-hairline rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-signature/20 focus:border-accent-signature text-sm font-medium text-text-primary"
                >
                  {GRADIENTS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Calendarización (Publicado y Expiración) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-bg-base/10 border border-gray-150 p-4 rounded-2xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-accent-acceso" /> Fecha de Publicación
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-bg-base border border-border-hairline rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-signature/20 focus:border-accent-signature text-sm font-medium text-text-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-wider block flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-accent-alert" /> Fecha de Expiración (Vigencia)
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-bg-base border border-border-hairline rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-signature/20 focus:border-accent-signature text-sm font-medium text-text-primary"
                  />
                  <span className="text-[9px] text-text-secondary block font-medium">Dejar vacío para vigencia indefinida.</span>
                </div>
              </div>

              {/* Estatus Activo */}
              <div className="flex items-center space-x-3 py-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-accent-signature focus:ring-accent-signature border-gray-300"
                />
                <label htmlFor="is_active" className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider block cursor-pointer">
                  Publicación Activa e Visible
                </label>
              </div>

              {/* Botones de acción del Modal */}
              <div className="pt-4 border-t border-gray-150 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-text-secondary hover:bg-gray-100 uppercase tracking-wider cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-accent-signature hover:bg-accent-signature/95 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                >
                  {isPending ? 'Guardando...' : 'Guardar Publicación'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
