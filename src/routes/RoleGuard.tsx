import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/types/enums'

export function RoleGuard({ roles }: { roles: UserRole[] }) {
  const role = useAuthStore((s) => s.user?.role)

  if (!role || !roles.includes(role)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
