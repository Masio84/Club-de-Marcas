'use client'

import React, { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, ShieldOff, Users as UsersIcon } from 'lucide-react'
import { Profile } from '@/utils/data-service'
import { toggleBanUserAction } from '@/app/actions'

interface AdminUserManagerProps {
  profiles: Profile[]
  currentUserId: string
}

export default function AdminUserManager({ profiles, currentUserId }: AdminUserManagerProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleToggleBan = (userId: string, currentBanStatus: boolean) => {
    if (userId === currentUserId) {
      alert('No puedes suspenderte a ti mismo.')
      return
    }
    const action = currentBanStatus ? 'reactivar' : 'suspender'
    if (!confirm(`¿Estás seguro de que deseas ${action} a este usuario?`)) return

    startTransition(async () => {
      await toggleBanUserAction(userId, currentBanStatus)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-navy">Gestión de Usuarios</h2>
        <p className="text-xs text-gray-500">Administra los socios registrados en Club de Marcas.</p>
      </div>

      <div className="bg-pure-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 border-b border-gray-100 uppercase font-black tracking-wider">
                <th className="p-4">Correo Electrónico</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Registro</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-semibold text-navy">{profile.email}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        profile.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {profile.role === 'admin' ? 'Administrador' : 'Socio Cliente'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        profile.is_banned
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {profile.is_banned ? (
                          <><ShieldOff className="w-3 h-3" /><span>Suspendido</span></>
                        ) : (
                          <><ShieldCheck className="w-3 h-3" /><span>Activo</span></>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 font-medium">
                      {new Date(profile.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td className="p-4 text-right">
                      {profile.id !== currentUserId && (
                        <button
                          onClick={() => handleToggleBan(profile.id, profile.is_banned)}
                          disabled={isPending}
                          className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer ${
                            profile.is_banned
                              ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                              : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          }`}
                        >
                          {profile.is_banned ? 'Reactivar' : 'Suspender'}
                        </button>
                      )}
                      {profile.id === currentUserId && (
                        <span className="text-[10px] text-gray-400 italic">Tú</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
