import { Shield, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { UserRole } from '@/types/enums'

interface RoleBadgeProps {
  role: UserRole
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const { t } = useTranslation('common')
  const isAdmin = role === UserRole.ADMIN
  const label = isAdmin ? t('role.admin') : t('role.employee')
  const Icon = isAdmin ? Shield : User

  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-md px-2 text-xs font-medium',
        isAdmin ? 'bg-secondary/10 text-secondary' : 'bg-info/10 text-info',
        className,
      )}
      aria-label={label}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}
