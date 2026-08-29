import { ChevronDown, Paperclip } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { DepartmentBadge } from '@/components/molecules/DepartmentBadge'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  useApproveRequest,
  useRejectRequest,
  useStartReview,
} from '@/hooks/useRequests'
import { RequestStatus } from '@/types/enums'
import type { ApplicationResponse } from '@/types/request.types'
import { cn } from '@/utils/cn'
import { formatDateTime } from '@/utils/formatDate'
import { activateOnKey, interactiveRow } from '@/utils/interactive'
import { statusKey } from '@/utils/status'

interface ExpandableRequestRowProps {
  request: ApplicationResponse
  expanded: boolean
  onToggle: () => void
  /** Admin-only status actions. */
  canModerate: boolean
  onOpenDetail: () => void
}

export function ExpandableRequestRow({
  request,
  expanded,
  onToggle,
  canModerate,
  onOpenDetail,
}: ExpandableRequestRowProps) {
  const { t, i18n } = useTranslation(['requests', 'common', 'status'])
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const startReview = useStartReview()
  const approve = useApproveRequest()
  const reject = useRejectRequest()

  const lastEntry = request.timeline?.[request.timeline.length - 1]
  const attachmentCount = request.attachments?.length ?? 0
  const busy = startReview.isPending || approve.isPending || reject.isPending

  const run = async (action: () => Promise<unknown>, successKey: string) => {
    try {
      await action()
      toast.success(t(successKey))
      setRejecting(false)
      setReason('')
    } catch {
      toast.error(t('common:toast.error.conflict'))
    }
  }

  return (
    <li className="border-b border-border last:border-b-0">
      <div
        role="button"
        aria-expanded={expanded}
        aria-label={request.title}
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={activateOnKey(onToggle)}
        className={cn('flex items-center gap-3 px-4 py-3', interactiveRow)}
      >
        <ChevronDown
          aria-hidden
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-fast',
            expanded && 'rotate-180',
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{request.title}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="truncate">
              {request.applicant.name} {request.applicant.surname}
            </span>
            <DepartmentBadge department={request.applicant.department} compact className="h-5" />
            <span>{request.formTypeName}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {attachmentCount > 0 ? (
            <span
              className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex"
              title={t('requests:explorer.attachments', { count: attachmentCount })}
            >
              <Paperclip aria-hidden className="h-3 w-3" />
              {attachmentCount}
            </span>
          ) : null}
          <StatusBadge status={request.status} />
          <span className="hidden text-xs tabular-nums text-muted-foreground md:inline">
            {formatDateTime(request.createdDate, i18n.language)}
          </span>
        </div>
      </div>

      {expanded ? (
        <div className="animate-expand-in space-y-3 border-t border-border bg-muted/30 px-4 py-3">
          <p className="whitespace-pre-line text-sm text-foreground">{request.description}</p>

          <dl className="grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
            <div className="flex gap-1">
              <dt>{t('requests:explorer.lastUpdate')}:</dt>
              <dd className="text-foreground">
                {formatDateTime(request.updatedDate, i18n.language)}
                {lastEntry ? ` · ${t(`status:${statusKey(lastEntry.status)}`)}` : ''}
              </dd>
            </div>
            <div className="flex gap-1">
              <dt>{t('requests:fields.attachments')}:</dt>
              <dd className="text-foreground">
                {attachmentCount > 0
                  ? t('requests:explorer.attachments', { count: attachmentCount })
                  : t('requests:explorer.noAttachments')}
              </dd>
            </div>
          </dl>

          {rejecting ? (
            <div className="animate-expand-in space-y-2 rounded-md border border-border bg-card p-3">
              <p className="text-sm font-medium">{t('requests:rejectTitle')}</p>
              <Textarea
                value={reason}
                autoFocus
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('requests:rejectReason')}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setRejecting(false)}>
                  {t('common:actions.cancel')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    void run(
                      () => reject.mutateAsync({ id: request.id, reason }),
                      'common:toast.success.rejected',
                    )
                  }
                >
                  {t('common:admin.reject')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {canModerate && request.status === RequestStatus.NEW ? (
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    void run(
                      () => startReview.mutateAsync(request.id),
                      'requests:explorer.reviewStarted',
                    )
                  }
                >
                  {t('requests:explorer.startReview')}
                </Button>
              ) : null}
              {canModerate && request.status === RequestStatus.IN_REVIEW ? (
                <>
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      void run(
                        () => approve.mutateAsync(request.id),
                        'common:toast.success.approved',
                      )
                    }
                  >
                    {t('common:admin.approve')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={busy}
                    onClick={() => {
                      setReason('')
                      setRejecting(true)
                    }}
                  >
                    {t('common:admin.reject')}
                  </Button>
                </>
              ) : null}
              <Button variant="outline" size="sm" onClick={onOpenDetail}>
                {t('requests:explorer.detail')}
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </li>
  )
}
