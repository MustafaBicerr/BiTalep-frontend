import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { interactiveChip } from '@/utils/interactive'

export interface FilterChipProps {
  active: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}

/** Toggleable pill used for filter bars in dialogs, widgets and reports. */
export function FilterChip({ active, onClick, children, className }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-medium',
        interactiveChip,
        active
          ? 'border-primary bg-primary-subtle text-primary'
          : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
        className,
      )}
    >
      {children}
    </button>
  )
}
