import {
  Ban,
  CheckCircle2,
  CircleDot,
  Clock,
  PencilLine,
  XOctagon,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import type { RequestStatus } from '@/types/enums'

const STATUS_CONFIG: Record<
  RequestStatus,
  { icon: LucideIcon; colorClass: string; key: string }
> = {
  NEW: { icon: CircleDot, colorClass: 'text-status-new bg-status-new/10', key: 'new' },
  IN_REVIEW: { icon: Clock, colorClass: 'text-status-review bg-status-review/10', key: 'inReview' },
  NEEDS_UPDATE: {
    icon: PencilLine,
    colorClass: 'text-status-needsUpdate bg-status-needsUpdate/10',
    key: 'needsUpdate',
  },
  APPROVED: {
    icon: CheckCircle2,
    colorClass: 'text-status-approved bg-status-approved/10',
    key: 'approved',
  },
  REJECTED: {
    icon: XOctagon,
    colorClass: 'text-status-rejected bg-status-rejected/10',
    key: 'rejected',
  },
  CANCELLED: {
    icon: Ban,
    colorClass: 'text-status-cancelled bg-status-cancelled/10',
    key: 'cancelled',
  },
}

interface StatusBadgeProps {
  status: RequestStatus
  variant?: 'subtle' | 'solid' | 'dot'
  className?: string
}

export function StatusBadge({ status, variant = 'subtle', className }: StatusBadgeProps) {
  const { t } = useTranslation('status')
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  const label = t(config.key)

  if (variant === 'dot') {
    return (
      <span className={cn('inline-flex items-center gap-2 text-sm', className)} aria-label={label}>
        <span className={cn('h-2 w-2 rounded-full', config.colorClass.split(' ')[0]?.replace('text-', 'bg-'))} />
        {label}
      </span>
    )
  }

  if (variant === 'solid') {
    return (
      <span
        className={cn(
          'inline-flex h-6 items-center gap-1 rounded-md px-2 text-xs font-medium text-white',
          status === 'NEW' && 'bg-status-new',
          status === 'IN_REVIEW' && 'bg-status-review',
          status === 'NEEDS_UPDATE' && 'bg-status-needsUpdate',
          status === 'APPROVED' && 'bg-status-approved',
          status === 'REJECTED' && 'bg-status-rejected',
          status === 'CANCELLED' && 'bg-status-cancelled',
          className,
        )}
        aria-label={label}
      >
        <Icon className="h-3 w-3" />
        {label}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-md px-2 text-xs font-medium',
        config.colorClass,
        className,
      )}
      aria-label={label}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}
