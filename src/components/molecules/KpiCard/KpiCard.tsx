import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/cn'

interface KpiCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  tone?: 'info' | 'warning' | 'success' | 'destructive' | 'primary'
  loading?: boolean
  error?: boolean
  onRetry?: () => void
  className?: string
}

const toneMap = {
  info: 'text-info bg-info/10',
  warning: 'text-warning bg-warning/10',
  success: 'text-success bg-success/10',
  destructive: 'text-destructive bg-destructive/10',
  primary: 'text-primary bg-primary-subtle',
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = 'primary',
  loading,
  error,
  onRetry,
  className,
}: KpiCardProps) {
  if (loading) {
    return <Skeleton className={cn('h-[100px] w-full rounded-lg', className)} />
  }

  return (
    <div
      className={cn(
        'flex h-[100px] flex-col justify-between rounded-lg border border-border bg-card p-4 shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn('inline-flex rounded-md p-2', toneMap[tone])}>
          <Icon className="h-6 w-6" />
        </span>
      </div>
      {error ? (
        <button type="button" onClick={onRetry} className="text-left text-sm text-destructive">
          —
        </button>
      ) : (
        <p className="text-2xl font-bold leading-tight text-foreground">{value}</p>
      )}
    </div>
  )
}
