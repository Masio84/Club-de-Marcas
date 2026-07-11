'use client'

import React, { useState, useTransition } from 'react'
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Sparkles } from 'lucide-react'
import { Product } from '@/utils/data-service'
import { addProductAction, updateProductAction, deleteProductAction } from '@/app/actions'
import YieldChip from '@/components/YieldChip'

interface AdminProductManagerProps {
  products: Product[]
}

export default function AdminProductManager({ products }: AdminProductManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isPending, startTransition] = useTransition()

  const openAddModal = () => {
    setEditingProduct(null)
    setIsOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto permanentemente?')) {
      startTransition(async () => {
        await deleteProductAction(id)
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      if (editingProduct) {
        formData.append('id', editingProduct.id)
        await updateProductAction(formData)
      } else {
        await addProductAction(formData)
      }
      setIsOpen(false)
      setEditingProduct(null)
    })
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-border-hairline pb-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-text-primary">Gestión de Catálogo</h2>
          <p className="text-xs text-text-secondary mt-1">Agrega, edita o elimina productos del outlet Club de Marcas.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-accent-signature hover:bg-accent-signature/95 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase flex items-center space-x-1.5 transition-all shadow-md hover:scale-[1.02] cursor-pointer animate-shine-sweep"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Agregar Producto</span>
        </button>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-bg-surface rounded-2xl border border-border-hairline shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-bg-base text-text-secondary border-b border-border-hairline uppercase font-mono tracking-wider">
                <th className="p-4 font-semibold">Imagen</th>
                <th className="p-4 font-semibold">Título</th>
                <th className="p-4 font-semibold">Categoría</th>
                <th className="p-4 font-semibold">Precio Outlet</th>
                <th className="p-4 font-semibold">Precio Original</th>
                <th className="p-4 text-center font-semibold">Stock</th>
                <th className="p-4 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    No hay productos disponibles en el catálogo. Crea uno nuevo.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50">
                    {/* Miniatura */}
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </td>

                    {/* Título */}
                    <td className="p-4 font-semibold text-text-primary max-w-[200px]" title={product.title}>
                      <div className="flex flex-col space-y-1">
                        <span className="truncate">{product.title}</span>
                        <div className="flex items-center space-x-1.5">
                          {product.is_prestige && (
                            <span className="bg-[#12161F] text-[#0EA372] text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border border-[#0EA372]/20">
                              👑 Prestige
                            </span>
                          )}
                          <div className="flex items-center space-x-1">
                            <YieldChip rate={product.return_rate_basic ?? 2.0} tier="basic" />
                            <YieldChip rate={product.return_rate_premium ?? 10.0} tier="premium" />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="p-4">
                      <span className="bg-bg-base text-text-secondary border border-border-hairline font-semibold px-2.5 py-0.5 rounded-full uppercase text-[10px]">
                        {product.category}
                      </span>
                    </td>

                    {/* Precio Outlet */}
                    <td className="p-4 font-bold font-mono text-text-primary">
                      ${product.price.toLocaleString('es-MX')}
                    </td>

                    {/* Precio Original */}
                    <td className="p-4 font-mono text-text-secondary line-through">
                      {product.original_price ? `$${product.original_price.toLocaleString('es-MX')}` : '-'}
                    </td>

                    {/* Stock */}
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md font-mono font-bold text-[10px] ${
                        product.inventory === 0
                          ? 'bg-red-50 text-[#C93B31] border border-[#C93B31]/20'
                          : product.inventory <= 5
                          ? 'bg-accent-signature-tint text-accent-signature border border-accent-signature/20 animate-pulse'
                          : 'bg-accent-acceso-tint text-accent-acceso border border-accent-acceso/20'
                      }`}>
                        {product.inventory} PZAS
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 text-text-secondary hover:text-[#0EA372] rounded-lg hover:bg-bg-base transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-text-secondary hover:text-[#C93B31] rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL / FORMULARIO CRUD (Agregar y Editar) */}
      {isOpen && (
        <div className="fixed inset-0 bg-[#12161F]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-bg-surface rounded-3xl border border-border-hairline shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn my-8">
            {/* Cabecera Modal */}
            <div className="p-6 bg-bg-dark-panel text-white flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-5 h-5 text-accent-acceso" />
                <h3 className="text-base font-display font-semibold uppercase tracking-wider">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Título */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-text-primary uppercase tracking-wider block">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingProduct?.title || ''}
                  placeholder="Ej. Nike Air Max 90 Black"
                  className="w-full text-xs bg-bg-base text-text-primary placeholder-gray-400 p-2.5 rounded-lg border border-border-hairline focus:outline-none focus:border-accent-acceso focus:ring-1 focus:ring-accent-acceso"
                />
              </div>

              {/* Fila Categoría y Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-text-primary uppercase tracking-wider block">
                    Categoría
                  </label>
                  <select
                    name="category"
                    required
                    defaultValue={editingProduct?.category || 'Calzado'}
                    className="w-full text-xs bg-bg-base text-text-primary p-2.5 rounded-lg border border-border-hairline focus:outline-none focus:border-accent-acceso focus:ring-1 focus:ring-accent-acceso"
                  >
                    <option value="Ropa">Ropa</option>
                    <option value="Calzado">Calzado</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-text-primary uppercase tracking-wider block">
                    Inventario (Pzas)
                  </label>
                  <input
                    type="number"
                    name="inventory"
                    required
                    min={0}
                    defaultValue={editingProduct?.inventory ?? 10}
                    className="w-full text-xs bg-bg-base text-text-primary p-2.5 rounded-lg border border-border-hairline focus:outline-none focus:border-accent-acceso focus:ring-1 focus:ring-accent-acceso"
                  />
                </div>
              </div>

              {/* Fila Precios */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-text-primary uppercase tracking-wider block">
                    Precio Outlet ($ MXN)
                  </label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    required
                    min={0}
                    defaultValue={editingProduct?.price || ''}
                    placeholder="2499.00"
                    className="w-full text-xs bg-bg-base text-text-primary p-2.5 rounded-lg border border-border-hairline focus:outline-none focus:border-accent-acceso focus:ring-1 focus:ring-accent-acceso"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-text-primary uppercase tracking-wider block">
                    Precio Original (Opcional)
                  </label>
                  <input
                    type="number"
                    name="original_price"
                    step="0.01"
                    min={0}
                    defaultValue={editingProduct?.original_price || ''}
                    placeholder="3199.00"
                    className="w-full text-xs bg-bg-base text-text-primary p-2.5 rounded-lg border border-border-hairline focus:outline-none focus:border-accent-acceso focus:ring-1 focus:ring-accent-acceso"
                  />
                </div>
              </div>

              {/* Opciones de Membresía y Retorno */}
              <div className="bg-bg-base p-4 rounded-xl border border-border-hairline space-y-4 text-left">
                <span className="text-[10px] font-mono font-bold text-text-primary uppercase tracking-wider block">
                  Configuración de Recompensas (Saldo Club)
                </span>
                
                {/* Prestige Checkbox */}
                <div className="flex items-center space-x-2.5">
                  <input
                    type="checkbox"
                    id="is_prestige"
                    name="is_prestige"
                    defaultChecked={editingProduct?.is_prestige || false}
                    className="w-4 h-4 rounded text-accent-signature focus:ring-accent-signature cursor-pointer"
                  />
                  <label htmlFor="is_prestige" className="text-xs font-bold text-text-primary select-none cursor-pointer flex items-center">
                    <span>Marca de Prestigio 👑</span>
                    <span className="text-[9px] text-text-secondary font-semibold ml-1.5">(Exclusivo para Socios Signature)</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-semibold text-text-secondary uppercase block">
                      Retorno Acceso (%)
                    </label>
                    <input
                      type="number"
                      name="return_rate_basic"
                      step="0.1"
                      min={0}
                      defaultValue={editingProduct?.return_rate_basic ?? 2.0}
                      className="w-full text-xs bg-bg-surface text-text-primary p-2 rounded-lg border border-border-hairline focus:outline-none focus:border-accent-acceso focus:ring-1 focus:ring-accent-acceso"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-semibold text-text-secondary uppercase block">
                      Retorno Signature (%)
                    </label>
                    <input
                      type="number"
                      name="return_rate_premium"
                      step="0.1"
                      min={0}
                      defaultValue={editingProduct?.return_rate_premium ?? 10.0}
                      className="w-full text-xs bg-bg-surface text-text-primary p-2 rounded-lg border border-border-hairline focus:outline-none focus:border-accent-acceso focus:ring-1 focus:ring-accent-acceso"
                    />
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-text-primary uppercase tracking-wider block">
                  Descripción del Producto
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingProduct?.description || ''}
                  placeholder="Detalles sobre materiales, horma, resistencia, etc."
                  className="w-full text-xs bg-bg-base text-text-primary placeholder-gray-400 p-2.5 rounded-lg border border-border-hairline focus:outline-none focus:border-accent-acceso focus:ring-1 focus:ring-accent-acceso"
                />
              </div>

              {/* Archivo o URL de Imagen */}
              <div className="space-y-2 border-t border-border-hairline pt-3">
                <span className="text-[10px] font-mono font-bold text-text-primary uppercase tracking-wider block">
                  Imagen del Producto
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-semibold text-text-secondary uppercase block">
                      Subir Archivo
                    </label>
                    <input
                      type="file"
                      name="image_file"
                      accept="image/*"
                      className="w-full text-[10px] text-text-secondary file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-bg-base file:text-text-primary hover:file:bg-border-hairline cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-semibold text-text-secondary uppercase block">
                      O pegar URL
                    </label>
                    <input
                      type="text"
                      name="image_url"
                      defaultValue={editingProduct?.image_url || ''}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="w-full text-[10px] bg-bg-base text-text-primary placeholder-gray-400 p-2 rounded-lg border border-border-hairline focus:outline-none focus:border-accent-acceso focus:ring-1 focus:ring-accent-acceso"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="border-t border-border-hairline pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-text-secondary hover:text-text-primary text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-bg-base transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-accent-signature hover:bg-accent-signature/95 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:scale-[1.01] cursor-pointer animate-shine-sweep"
                >
                  {isPending ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
