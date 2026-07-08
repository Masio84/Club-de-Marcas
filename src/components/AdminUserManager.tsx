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
    <div className="space-y-6 font-sans">
      <div className="border-b border-border-hairline pb-4">
        <h2 className="text-2xl font-display font-semibold text-text-primary">Gestión de Usuarios</h2>
        <p className="text-xs text-text-secondary mt-1">Administra los socios registrados en Club de Marcas.</p>
      </div>

      <div className="bg-bg-surface rounded-2xl border border-border-hairline shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-bg-base text-text-secondary border-b border-border-hairline uppercase font-mono tracking-wider">
                <th className="p-4 font-semibold">Correo Electrónico</th>
                <th className="p-4 font-semibold">Rol</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold">Registro</th>
                <th className="p-4 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline/60">
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    No hay usuarios registrados.
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-bg-base/45 transition-colors">
                    <td className="p-4 font-medium text-text-primary">{profile.email}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        profile.role === 'admin'
                          ? 'bg-accent-signature-tint text-accent-signature border border-accent-signature/20'
                          : 'bg-bg-base text-text-secondary border border-border-hairline'
                      }`}>
                        {profile.role === 'admin' ? 'Administrador' : 'Socio Cliente'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        profile.is_banned
                          ? 'bg-red-50 text-[#C93B31] border border-[#C93B31]/20'
                          : 'bg-accent-acceso-tint text-accent-acceso border border-accent-acceso/20'
                      }`}>
                        {profile.is_banned ? (
                          <><ShieldOff className="w-3 h-3 text-[#C93B31]" /><span>Suspendido</span></>
                        ) : (
                          <><ShieldCheck className="w-3 h-3 text-accent-acceso" /><span>Activo</span></>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-text-secondary font-mono">
                      {new Date(profile.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td className="p-4 text-right">
                      {profile.id !== currentUserId && (
                        <button
                          onClick={() => handleToggleBan(profile.id, profile.is_banned)}
                          disabled={isPending}
                          className={`text-xs font-mono font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                            profile.is_banned
                              ? 'bg-accent-acceso-tint text-accent-acceso border border-accent-acceso/25 hover:bg-[#DCF3EA] hover:scale-[1.01]'
                              : 'bg-red-50 text-[#C93B31] border border-[#C93B31]/25 hover:bg-red-100/60 hover:scale-[1.01]'
                          }`}
                        >
                          {profile.is_banned ? 'Reactivar' : 'Suspender'}
                        </button>
                      )}
                      {profile.id === currentUserId && (
                        <span className="text-[10px] text-text-secondary font-mono italic">Tú</span>
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
