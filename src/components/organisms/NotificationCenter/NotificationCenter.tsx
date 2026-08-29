import {
  CheckCircle,
  FileText,
  Info,
  RefreshCw,
  Upload,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/molecules/EmptyState'
import { TableRowSkeleton } from '@/components/molecules/SkeletonTemplates'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useMarkAllRead, useMarkRead, useNotifications } from '@/hooks/useNotifications'
import { useUiStore } from '@/stores/uiStore'
import { NotificationType } from '@/types/enums'
import { formatRelative } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import { interactiveRow } from '@/utils/interactive'

const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  [NotificationType.STATUS_CHANGE]: RefreshCw,
  [NotificationType.APPROVED]: CheckCircle,
  [NotificationType.REJECTED]: XCircle,
  [NotificationType.NEW_REQUEST]: FileText,
  [NotificationType.FILE_UPLOADED]: Upload,
  [NotificationType.SYSTEM]: Info,
}

export function NotificationCenter() {
  const { t, i18n } = useTranslation(['notifications', 'common'])
  const open = useUiStore((s) => s.notificationPanelOpen)
  const setOpen = useUiStore((s) => s.setNotificationPanelOpen)
  const { data, isLoading } = useNotifications({ page: 1, pageSize: 20 })
  const markRead = useMarkRead()
  const markAll = useMarkAllRead()

  const rows = data?.data ?? []

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[380px]"
      >
        <SheetHeader className="flex h-12 flex-row items-center justify-between space-y-0 border-b border-border px-4">
          <SheetTitle className="text-base font-semibold">{t('notifications:title')}</SheetTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => void markAll.mutateAsync()}
          >
            {t('notifications:markAllRead')}
          </Button>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="px-2 py-2" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={3} />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState preset="noNotifications" className="min-h-[240px]" />
          ) : (
            <ul className="divide-y divide-border" aria-live="polite">
              {rows.map((n) => {
                const Icon = TYPE_ICONS[n.type] ?? Info
                return (
                  <li key={n.id}>
                    <Link
                      to={n.relatedRequestId ? `/requests/${n.relatedRequestId}` : '/notifications'}
                      className={cn(
                        'relative flex min-h-16 gap-3 px-4 py-3',
                        interactiveRow,
                        !n.isRead && 'bg-primary-subtle hover:bg-primary-subtle/70',
                      )}
                      onClick={() => {
                        if (!n.isRead) void markRead.mutateAsync(n.id)
                        setOpen(false)
                      }}
                    >
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.description}</p>
                        <time className="mt-1 block text-xs text-muted-foreground">
                          {formatRelative(n.createdDate, i18n.language)}
                        </time>
                      </div>
                      {!n.isRead ? (
                        <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary" />
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </ScrollArea>

        <div className="border-t border-border p-3">
          <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
            <Link to="/notifications">{t('notifications:viewAll')}</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
