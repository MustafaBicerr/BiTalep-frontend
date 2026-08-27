import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Pagination } from '@/components/molecules/Pagination'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/atoms/Spinner'
import { useMarkAllRead, useMarkRead, useNotifications } from '@/hooks/useNotifications'
import { formatRelative } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

export function NotificationsPage() {
  const { t, i18n } = useTranslation(['notifications', 'common'])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data, isLoading } = useNotifications({ page, pageSize })
  const markRead = useMarkRead()
  const markAll = useMarkAllRead()

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  const rows = data?.data ?? []
  const total = data?.meta?.totalItems ?? 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h1">{t('notifications:title')}</h1>
        <Button type="button" variant="outline" onClick={() => void markAll.mutateAsync()}>
          {t('notifications:markAllRead')}
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState preset="noNotifications" />
      ) : (
        <>
          <ul className="divide-y divide-border rounded-lg border border-border bg-card" aria-live="polite">
            {rows.map((n) => (
              <li key={n.id}>
                <Link
                  to={n.relatedRequestId ? `/requests/${n.relatedRequestId}` : '#'}
                  className={cn(
                    'block min-h-16 p-4 hover:bg-muted/50',
                    !n.isRead && 'bg-primary-subtle',
                  )}
                  onClick={() => {
                    if (!n.isRead) void markRead.mutateAsync(n.id)
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!n.isRead ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                      <time className="text-xs text-muted-foreground">
                        {formatRelative(n.createdDate, i18n.language)}
                      </time>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s)
              setPage(1)
            }}
          />
        </>
      )}
    </div>
  )
}
