import React from 'react'
import { DataService } from '@/utils/data-service'
import AdminUserManager from '@/components/AdminUserManager'

export default async function AdminUsersPage() {
  const profiles = await DataService.getProfiles()
  const user = await DataService.getCurrentUser()

  return <AdminUserManager profiles={profiles} currentUserId={user?.id || ''} />
}
