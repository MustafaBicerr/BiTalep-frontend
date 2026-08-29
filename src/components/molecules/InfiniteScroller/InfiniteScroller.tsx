import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/cn'

export interface InfiniteScrollerProps {
  /** More pages exist and the page cap has not been reached. */
  canLoadMore: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  /** Scroll container to observe within; omit to use the viewport. */
  root?: Element | null
  /** How early to prefetch. Default keeps a screenful ready before it is visible. */
  rootMargin?: string
  /** Page cap hit: render a deep link instead of loading forever. */
  capReached?: boolean
  capAction?: React.ReactNode
  /** Skeleton rows shown while the next page is in flight. */
  skeletonRows?: number
  skeletonHeight?: number
  className?: string
}

/**
 * Prefetches the next page before its sentinel is visible, so lists feel
 * already-loaded instead of loading. No spinner: fading row skeletons only.
 */
export function InfiniteScroller({
  canLoadMore,
  isFetchingNextPage,
  fetchNextPage,
  root,
  rootMargin = '600px 0px',
  capReached,
  capAction,
  skeletonRows = 3,
  skeletonHeight = 44,
  className,
}: InfiniteScrollerProps) {
  const { t } = useTranslation('common')
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)
  const fetchRef = React.useRef(fetchNextPage)
  fetchRef.current = fetchNextPage

  React.useEffect(() => {
    const node = sentinelRef.current
    if (!node || !canLoadMore || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) fetchRef.current()
      },
      { root: root ?? null, rootMargin, threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [canLoadMore, root, rootMargin])

  if (capReached) {
    return capAction ? <div className={cn('flex justify-center p-3', className)}>{capAction}</div> : null
  }

  return (
    <div className={className}>
      {canLoadMore ? <div ref={sentinelRef} aria-hidden className="h-px w-full" /> : null}
      {isFetchingNextPage ? (
        <div className="animate-fade-in space-y-1 p-1" aria-hidden>
          {Array.from({ length: skeletonRows }).map((_, index) => (
            <Skeleton key={index} className="w-full" style={{ height: skeletonHeight }} />
          ))}
        </div>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {isFetchingNextPage ? t('infinite.loadingMore') : ''}
      </span>
    </div>
  )
}
