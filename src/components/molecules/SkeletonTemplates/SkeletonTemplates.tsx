import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/cn'

export function KpiSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-[100px] w-full rounded-lg', className)} />
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex h-10 items-center gap-3 border-b border-border px-3">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  )
}

export function FormFieldSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export function CardSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-40 w-full rounded-lg', className)} />
}

export function AvatarSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-8 w-8 rounded-full', className)} />
}

export function TextBlockSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

export function ChartSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-[240px] w-full rounded-lg', className)} />
}

export function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-8 w-48" />
      <CardSkeleton />
      <CardSkeleton className="h-64" />
    </div>
  )
}

export function ListSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6" aria-busy="true">
      <CardSkeleton className="h-[160px]" />
      <CardSkeleton className="h-[240px]" />
    </div>
  )
}

export function FormPageSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="mx-auto max-w-2xl space-y-4" aria-busy="true">
      <Skeleton className="h-8 w-56" />
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        {Array.from({ length: fields }).map((_, i) => (
          <FormFieldSkeleton key={i} />
        ))}
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  )
}
