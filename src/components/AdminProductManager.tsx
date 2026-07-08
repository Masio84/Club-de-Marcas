'use client'

import React, { useState, useTransition } from 'react'
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Sparkles } from 'lucide-react'
import { Product } from '@/utils/data-service'
import { addProductAction, updateProductAction, deleteProductAction } from '@/app/actions'

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
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-navy">Gestión de Catálogo</h2>
          <p className="text-xs text-gray-500">Agrega, edita o elimina productos del outlet Club de Marcas.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-emerald hover:bg-emerald-hover text-navy font-bold py-2.5 px-4 rounded-xl text-xs uppercase flex items-center space-x-1.5 transition-all shadow-md hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Producto</span>
        </button>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-pure-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 border-b border-gray-100 uppercase font-black tracking-wider">
                <th className="p-4">Imagen</th>
                <th className="p-4">Título</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Precio Outlet</th>
                <th className="p-4">Precio Original</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 text-right">Acciones</th>
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
                    <td className="p-4 font-bold text-navy max-w-[200px]" title={product.title}>
                      <div className="flex flex-col">
                        <span className="truncate">{product.title}</span>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          {product.is_prestige && (
                            <span className="bg-navy text-emerald text-[8px] font-black uppercase px-1 rounded">
                              👑 Signature
                            </span>
                          )}
                          <span className="text-[8px] text-gray-400 font-bold">
                            R: {product.return_rate_basic || 2}% / {product.return_rate_premium || 10}%
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="p-4">
                      <span className="bg-navy-light/10 text-navy font-semibold px-2.5 py-0.5 rounded-full uppercase text-[10px]">
                        {product.category}
                      </span>
                    </td>

                    {/* Precio Outlet */}
                    <td className="p-4 font-black text-navy">
                      ${product.price.toLocaleString('es-MX')} MXN
                    </td>

                    {/* Precio Original */}
                    <td className="p-4 text-gray-400 font-medium">
                      {product.original_price ? `$${product.original_price.toLocaleString('es-MX')}` : '-'}
                    </td>

                    {/* Stock */}
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-md font-bold ${
                        product.inventory === 0
                          ? 'bg-red-100 text-red-800'
                          : product.inventory <= 5
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.inventory} pzas
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 text-navy hover:text-emerald rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-pure-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn my-8">
            {/* Cabecera Modal */}
            <div className="p-6 bg-navy text-pure-white flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-5 h-5 text-emerald" />
                <h3 className="text-base font-black uppercase tracking-wider">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-pure-white p-1 rounded-full hover:bg-navy-light/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Título */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-navy uppercase tracking-wider block">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingProduct?.title || ''}
                  placeholder="Ej. Nike Air Max 90 Black"
                  className="w-full text-xs bg-gray-50 text-navy placeholder-gray-400 p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-navy"
                />
              </div>

              {/* Fila Categoría y Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-navy uppercase tracking-wider block">
                    Categoría
                  </label>
                  <select
                    name="category"
                    required
                    defaultValue={editingProduct?.category || 'Tenis'}
                    className="w-full text-xs bg-gray-50 text-navy p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-navy"
                  >
                    <option value="Tenis">Tenis</option>
                    <option value="Relojes">Relojes</option>
                    <option value="Gorras">Gorras</option>
                    <option value="Lentes">Lentes</option>
                    <option value="Bolsas">Bolsas</option>
                    <option value="Cuidado Personal">Cuidado Personal</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-navy uppercase tracking-wider block">
                    Inventario (Pzas)
                  </label>
                  <input
                    type="number"
                    name="inventory"
                    required
                    min={0}
                    defaultValue={editingProduct?.inventory ?? 10}
                    className="w-full text-xs bg-gray-50 text-navy p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-navy"
                  />
                </div>
              </div>

              {/* Fila Precios */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-navy uppercase tracking-wider block">
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
                    className="w-full text-xs bg-gray-50 text-navy p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-navy"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-navy uppercase tracking-wider block">
                    Precio Original (Opcional)
                  </label>
                  <input
                    type="number"
                    name="original_price"
                    step="0.01"
                    min={0}
                    defaultValue={editingProduct?.original_price || ''}
                    placeholder="3199.00"
                    className="w-full text-xs bg-gray-50 text-navy p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-navy"
                  />
                </div>
              </div>

              {/* Opciones de Membresía y Retorno */}
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-150 space-y-4 text-left">
                <span className="text-[10px] font-black text-navy uppercase tracking-wider block">
                  Configuración de Retorno (Bóveda)
                </span>
                
                {/* Prestige Checkbox */}
                <div className="flex items-center space-x-2.5">
                  <input
                    type="checkbox"
                    id="is_prestige"
                    name="is_prestige"
                    defaultChecked={editingProduct?.is_prestige || false}
                    className="w-4 h-4 rounded text-navy focus:ring-navy cursor-pointer"
                  />
                  <label htmlFor="is_prestige" className="text-xs font-bold text-navy select-none cursor-pointer flex items-center">
                    <span>Marca de Prestigio 👑</span>
                    <span className="text-[9px] text-gray-400 font-semibold ml-1.5">(Exclusivo para Socios Signature)</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase block">
                      Retorno Acceso (%)
                    </label>
                    <input
                      type="number"
                      name="return_rate_basic"
                      step="0.1"
                      min={0}
                      defaultValue={editingProduct?.return_rate_basic ?? 2.0}
                      className="w-full text-xs bg-pure-white text-navy p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-navy"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase block">
                      Retorno Signature (%)
                    </label>
                    <input
                      type="number"
                      name="return_rate_premium"
                      step="0.1"
                      min={0}
                      defaultValue={editingProduct?.return_rate_premium ?? 10.0}
                      className="w-full text-xs bg-pure-white text-navy p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-navy"
                    />
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-navy uppercase tracking-wider block">
                  Descripción del Producto
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingProduct?.description || ''}
                  placeholder="Detalles sobre materiales, horma, resistencia, etc."
                  className="w-full text-xs bg-gray-50 text-navy placeholder-gray-400 p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-navy"
                />
              </div>

              {/* Archivo o URL de Imagen */}
              <div className="space-y-2 border-t border-gray-100 pt-3">
                <span className="text-[10px] font-black text-navy uppercase tracking-wider block">
                  Imagen del Producto
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase block">
                      Subir Archivo
                    </label>
                    <input
                      type="file"
                      name="image_file"
                      accept="image/*"
                      className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-navy-light/10 file:text-navy hover:file:bg-navy-light/20 cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase block">
                      O pegar URL
                    </label>
                    <input
                      type="text"
                      name="image_url"
                      defaultValue={editingProduct?.image_url || ''}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="w-full text-[10px] bg-gray-50 text-navy placeholder-gray-400 p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-navy"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="border-t border-gray-100 pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-navy text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-emerald hover:bg-emerald-hover text-navy text-xs font-bold py-2.5 px-6 rounded-xl transition-all shadow-md hover:scale-[1.01] cursor-pointer"
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
