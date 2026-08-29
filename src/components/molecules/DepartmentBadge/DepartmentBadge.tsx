import { Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Department } from '@/types/enums'
import { cn } from '@/utils/cn'

interface DepartmentBadgeProps {
  department: Department
  className?: string
  /** Hides the icon for dense table cells. */
  compact?: boolean
}

export function DepartmentBadge({ department, className, compact }: DepartmentBadgeProps) {
  const { t } = useTranslation('common')
  const label = t(`department.${department}`)

  return (
    <span
      className={cn(
        'inline-flex h-6 max-w-full items-center gap-1 rounded-md border border-border bg-muted px-2 text-xs font-medium text-muted-foreground',
        className,
      )}
    >
      {compact ? null : <Building2 className="h-3 w-3 shrink-0" aria-hidden />}
      <span className="truncate">{label}</span>
    </span>
  )
}
