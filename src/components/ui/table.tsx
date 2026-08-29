import * as React from 'react'
import { cn } from '@/utils/cn'
import { interactiveRow } from '@/utils/interactive'

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  ),
)
Table.displayName = 'Table'

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />,
)
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  ),
)
TableBody.displayName = 'TableBody'

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Opt in to hover/active/focus affordances and Enter/Space activation. */
  interactive?: boolean
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, interactive, onClick, onKeyDown, tabIndex, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-border transition-colors data-[state=selected]:bg-primary-subtle',
        interactive && interactiveRow,
        className,
      )}
      onClick={onClick}
      tabIndex={interactive ? (tabIndex ?? 0) : tabIndex}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (!interactive || !onClick || event.defaultPrevented) return
        if (event.key !== 'Enter' && event.key !== ' ') return
        if (event.target !== event.currentTarget) return
        event.preventDefault()
        onClick(event as unknown as React.MouseEvent<HTMLTableRowElement>)
      }}
      {...props}
    />
  ),
)
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-11 px-3 text-left align-middle text-sm font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  ),
)
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn('h-10 px-3 py-2 align-middle [&:has([role=checkbox])]:pr-0', className)} {...props} />
  ),
)
TableCell.displayName = 'TableCell'

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell }
