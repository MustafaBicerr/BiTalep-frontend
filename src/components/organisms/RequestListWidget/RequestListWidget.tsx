import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FilterChip } from '@/components/molecules/FilterChip'
import { InfiniteScroller } from '@/components/molecules/InfiniteScroller'
import { ScrollPane } from '@/components/molecules/ScrollPane'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useInfiniteRequests, type InfiniteRequestParams } from '@/hooks/useInfiniteRequests'
import type { ApplicationResponse } from '@/types/request.types'
import { cn } from '@/utils/cn'
import { interactiveRow } from '@/utils/interactive'

/** Row height the visible-row budget is calculated from. */
const ROW_HEIGHT = 56

export interface WidgetChip {
  id: string
  label: string
  /** Extra list params contributed while this chip is active. */
  params?: InfiniteRequestParams
}

export interface WidgetSort {
  id: string
  label: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface RequestListWidgetProps {
  title: string
  baseParams: InfiniteRequestParams
  chips: WidgetChip[]
  sorts: WidgetSort[]
  /** How many rows stay visible before the pane starts scrolling. */
  visibleRows: number
  emptyText: string
  headerAction?: ReactNode
  /** Secondary line under the request title. */
  renderMeta: (request: ApplicationResponse) => ReactNode
}

/**
 * Dashboard widget with a bounded, self-owned scroll area: the list never grows
 * the page, and the next page is prefetched inside the pane.
 */
export function RequestListWidget({
  title,
  baseParams,
  chips,
  sorts,
  visibleRows,
  emptyText,
  headerAction,
  renderMeta,
}: RequestListWidgetProps) {
  const { t } = useTranslation(['dashboard', 'common'])
  const [chipId, setChipId] = useState(chips[0]?.id ?? '')
  const [sortId, setSortId] = useState(sorts[0]?.id ?? '')
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null)

  const chip = chips.find((c) => c.id === chipId) ?? chips[0]
  const sort = sorts.find((s) => s.id === sortId) ?? sorts[0]

  const query = useInfiniteRequests({
    ...baseParams,
    ...chip?.params,
    sortBy: sort?.sortBy,
    sortOrder: sort?.sortOrder,
  })
  const { items, totalItems } = query

  return (
    <section className="flex flex-col rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-h3">
          {title}
          <span className="rounded-md bg-primary-subtle px-2 py-0.5 text-xs font-medium tabular-nums text-primary">
            {totalItems}
          </span>
        </h2>
        {headerAction}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((option) => (
            <FilterChip
              key={option.id}
              active={option.id === chip?.id}
              onClick={() => setChipId(option.id)}
            >
              {option.label}
            </FilterChip>
          ))}
        </div>
        <Select value={sort?.id} onValueChange={setSortId}>
          <SelectTrigger className="h-7 w-[170px] text-xs" aria-label={t('dashboard:widget.sortLabel')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sorts.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {query.isLoading ? (
        <div className="space-y-1">
          {Array.from({ length: Math.min(visibleRows, 5) }).map((_, index) => (
            <Skeleton key={index} className="w-full" style={{ height: ROW_HEIGHT - 8 }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ScrollPane
          ref={setScrollRoot}
          maxHeight={visibleRows * ROW_HEIGHT}
          label={title}
          wrapperClassName="-mx-1"
          className="px-1"
        >
          <ul className="divide-y divide-border">
            {items.map((request) => (
              <li key={request.id}>
                <Link
                  to={`/requests/${request.id}`}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-md px-2 py-2.5',
                    interactiveRow,
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{request.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {renderMeta(request)}
                    </span>
                  </span>
                  <StatusBadge status={request.status} />
                </Link>
              </li>
            ))}
          </ul>
          <InfiniteScroller
            root={scrollRoot}
            canLoadMore={query.canLoadMore}
            capReached={query.capReached}
            isFetchingNextPage={query.isFetchingNextPage}
            fetchNextPage={() => void query.fetchNextPage()}
            skeletonRows={2}
            skeletonHeight={ROW_HEIGHT - 8}
          />
        </ScrollPane>
      )}
    </section>
  )
}
