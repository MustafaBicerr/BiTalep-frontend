import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { DepartmentBadge } from '@/components/molecules/DepartmentBadge'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { FileTypeIcon } from '@/components/molecules/FileTypeIcon'
import { DetailSkeleton } from '@/components/molecules/SkeletonTemplates'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useApproveRequest,
  useDeleteRequest,
  useNeedsUpdateRequest,
  useRejectRequest,
  useRequest,
  useStartReview,
} from '@/hooks/useRequests'
import { useAuthStore } from '@/stores/authStore'
import { RequestStatus, UserRole } from '@/types/enums'
import { formatDateTime } from '@/utils/formatDate'
import { isPersonnelMutable, personnelLockKey } from '@/utils/requestAccess'

export function RequestDetailPage() {
  const { id } = useParams()
  const requestId = id ?? ''
  const { t, i18n } = useTranslation(['requests', 'common', 'notifications'])
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)
  const userId = useAuthStore((s) => s.user?.id)
  const { data, isLoading } = useRequest(requestId)
  const approve = useApproveRequest()
  const reject = useRejectRequest()
  const remove = useDeleteRequest()
  const startReview = useStartReview()
  const needsUpdate = useNeedsUpdateRequest()

  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [needsUpdateOpen, setNeedsUpdateOpen] = useState(false)
  const [reason, setReason] = useState('')

  if (isLoading || !data) {
    return <DetailSkeleton />
  }

  const canEdit = isPersonnelMutable(data.status) && data.applicantId === userId
  const isAdmin = role === UserRole.ADMIN
  const canReview = isAdmin && data.status === RequestStatus.NEW
  const canDecide = isAdmin && data.status === RequestStatus.IN_REVIEW
  const canRequestUpdate =
    isAdmin && (data.status === RequestStatus.NEW || data.status === RequestStatus.IN_REVIEW)
  const lockKey = !canEdit && data.applicantId === userId ? personnelLockKey(data.status) : null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-h1">{data.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {data.formTypeName} · {formatDateTime(data.createdDate, i18n.language)}
          </p>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {data.status === RequestStatus.NEEDS_UPDATE && data.updateReason ? (
        <p className="rounded-md border border-status-needsUpdate/30 bg-status-needsUpdate/10 px-4 py-3 text-sm">
          {t('requests:needsUpdateBanner')} {data.updateReason}
        </p>
      ) : null}
      {lockKey ? (
        <p className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
          {t(`requests:${lockKey}`)}
        </p>
      ) : null}

      <section className="rounded-lg border border-border bg-card p-6">
        <p className="whitespace-pre-wrap text-base">{data.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>
            {data.applicant.name} {data.applicant.surname}
          </span>
          <DepartmentBadge department={data.applicant.department} />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-h3">{t('requests:timeline')}</h2>
        <ol className="space-y-4" role="list">
          {(data.timeline ?? []).map((entry, idx) => (
            <li key={`${entry.status}-${entry.date}-${idx}`} className="flex gap-3">
              <StatusBadge status={entry.status} variant="dot" />
              <div>
                <time dateTime={entry.date} className="text-xs text-muted-foreground">
                  {formatDateTime(entry.date, i18n.language)}
                </time>
                {entry.description ? <p className="text-sm">{entry.description}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-h3">{t('requests:fields.attachments')}</h2>
        <ul className="space-y-2">
          {(data.attachments ?? []).map((f) => (
            <li key={f.id} className="flex items-center gap-3 text-sm">
              <FileTypeIcon mimeType={f.mimeType} fileName={f.originalName} />
              <span>{f.originalName}</span>
            </li>
          ))}
          {(data.attachments ?? []).length === 0 ? (
            <li className="text-sm text-muted-foreground">—</li>
          ) : null}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2">
        {canEdit ? (
          <>
            <Button asChild variant="outline">
              <Link to={`/requests/${data.id}/edit`}>{t('common:actions.edit')}</Link>
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              {t('common:actions.delete')}
            </Button>
          </>
        ) : null}
        {canReview ? (
          <Button
            variant="outline"
            disabled={startReview.isPending}
            onClick={() =>
              void startReview
                .mutateAsync(data.id)
                .then(() => toast.success(t('requests:explorer.reviewStarted')))
                .catch(() => toast.error(t('common:toast.error.conflict')))
            }
          >
            {t('requests:explorer.startReview')}
          </Button>
        ) : null}
        {canDecide ? (
          <>
            <Button onClick={() => setApproveOpen(true)}>{t('common:admin.approve')}</Button>
            <Button variant="destructive" onClick={() => setRejectOpen(true)}>
              {t('common:admin.reject')}
            </Button>
          </>
        ) : null}
        {canRequestUpdate ? (
          <Button variant="outline" onClick={() => setNeedsUpdateOpen(true)}>
            {t('requests:needsUpdateTitle')}
          </Button>
        ) : null}
        <Button variant="ghost" onClick={() => navigate('/requests')}>
          {t('common:actions.back')}
        </Button>
      </div>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t('requests:approveTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('requests:approveDescription')}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              onClick={async () => {
                try {
                  await approve.mutateAsync(data.id)
                  toast.success(t('common:toast.success.approved'))
                  setApproveOpen(false)
                } catch {
                  toast.error(t('common:toast.error.conflict'))
                }
              }}
            >
              {t('common:admin.approve')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t('requests:rejectTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('requests:rejectDescription')}</p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('requests:rejectReason')}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  await reject.mutateAsync({ id: data.id, reason })
                  toast.success(t('common:toast.success.rejected'))
                  setRejectOpen(false)
                } catch {
                  toast.error(t('common:toast.error.conflict'))
                }
              }}
            >
              {t('common:admin.reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={needsUpdateOpen} onOpenChange={setNeedsUpdateOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t('requests:needsUpdateTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('requests:needsUpdateDescription')}</p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('requests:needsUpdateReason')}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNeedsUpdateOpen(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              onClick={async () => {
                try {
                  await needsUpdate.mutateAsync({ id: data.id, reason })
                  toast.success(t('common:toast.success.saved'))
                  setNeedsUpdateOpen(false)
                } catch {
                  toast.error(t('common:toast.error.conflict'))
                }
              }}
            >
              {t('requests:needsUpdateTitle')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t('requests:deleteConfirmTitle')}
        description={t('requests:deleteConfirmDescription')}
        destructive
        onConfirm={async () => {
          try {
            await remove.mutateAsync(data.id)
            toast.success(t('common:toast.success.deleted'))
            navigate('/requests')
          } catch {
            toast.error(t('common:toast.error.generic'))
          }
        }}
      />
    </div>
  )
}
