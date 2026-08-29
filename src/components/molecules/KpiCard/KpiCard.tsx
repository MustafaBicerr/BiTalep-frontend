import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/cn'
import { activateOnKey, interactiveTextLink, interactiveTile } from '@/utils/interactive'

interface KpiCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  tone?: 'info' | 'warning' | 'success' | 'destructive' | 'primary'
  loading?: boolean
  error?: boolean
  onRetry?: () => void
  /** Opens a drill-down explorer dialog; makes the whole card interactive. */
  onClick?: () => void
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
  onClick,
  className,
}: KpiCardProps) {
  if (loading) {
    return <Skeleton className={cn('h-[100px] w-full rounded-lg', className)} />
  }

  const clickable = Boolean(onClick) && !error

  return (
    <div
      role={clickable ? 'button' : 'region'}
      aria-label={label}
      aria-haspopup={clickable ? 'dialog' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable && onClick ? activateOnKey(onClick) : undefined}
      className={cn(
        'group/kpi flex h-[100px] flex-col justify-between rounded-lg border border-border bg-card p-4 shadow-sm',
        clickable && interactiveTile,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn('inline-flex rounded-md p-2', toneMap[tone])}>
          <Icon className="h-6 w-6" />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        {error ? (
          <button
            type="button"
            onClick={onRetry}
            className={cn('w-fit text-left text-sm text-destructive', interactiveTextLink)}
          >
            —
          </button>
        ) : (
          <p className="text-2xl font-bold leading-tight text-foreground">{value}</p>
        )}
        {clickable ? (
          <ArrowUpRight
            aria-hidden
            className="h-4 w-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-[opacity,transform] duration-fast group-hover/kpi:translate-x-0 group-hover/kpi:opacity-100 group-focus-visible/kpi:translate-x-0 group-focus-visible/kpi:opacity-100"
          />
        ) : null}
      </div>
    </div>
  )
}
