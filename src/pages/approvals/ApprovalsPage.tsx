import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FilterChip } from '@/components/molecules/FilterChip'
import { InfiniteScroller } from '@/components/molecules/InfiniteScroller'
import { SearchInput } from '@/components/molecules/SearchInput'
import { ScrollPane } from '@/components/molecules/ScrollPane'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useInfiniteRequests } from '@/hooks/useInfiniteRequests'
import {
  useApproveRequest,
  useNeedsUpdateRequest,
  useRejectRequest,
  useStartReview,
} from '@/hooks/useRequests'
import { DEPARTMENT_ORDER, Department, RequestStatus } from '@/types/enums'
import { cn } from '@/utils/cn'
import { formatDateTime } from '@/utils/formatDate'
import { interactiveRow } from '@/utils/interactive'

type QueueTab = 'IN_REVIEW' | 'NEW'
type SortId = 'waiting' | 'newest' | 'oldest' | 'type'

const SORTS: Record<SortId, { sortBy: string; sortOrder: 'asc' | 'desc' }> = {
  waiting: { sortBy: 'updatedDate', sortOrder: 'asc' },
  newest: { sortBy: 'createdDate', sortOrder: 'desc' },
  oldest: { sortBy: 'createdDate', sortOrder: 'asc' },
  type: { sortBy: 'formType', sortOrder: 'asc' },
}

const OVERDUE_DAYS = 3
const dayMs = 24 * 60 * 60 * 1000

function daysWaiting(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime()
  return Math.max(0, Math.floor(ms / dayMs))
}

export function ApprovalsPage() {
  const { t, i18n } = useTranslation(['approvals', 'requests', 'common', 'status'])
  const [tab, setTab] = useState<QueueTab>('IN_REVIEW')
  const [overdue, setOverdue] = useState(false)
  const [department, setDepartment] = useState<Department | 'all'>('all')
  const [sortId, setSortId] = useState<SortId>('waiting')
  const [keyword, setKeyword] = useState('')
  const [approveId, setApproveId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [needsUpdateId, setNeedsUpdateId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null)

  const overdueBefore = useMemo(
    () => new Date(Date.now() - OVERDUE_DAYS * dayMs).toISOString(),
    [],
  )
  const sort = SORTS[sortId]

  const params = useMemo(
    () => ({
      keyword: keyword || undefined,
      status: [tab as RequestStatus],
      department: department === 'all' ? undefined : [department],
      updatedBefore: overdue ? overdueBefore : undefined,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
    }),
    [keyword, tab, department, overdue, overdueBefore, sort.sortBy, sort.sortOrder],
  )

  const list = useInfiniteRequests(params)
  const approve = useApproveRequest()
  const reject = useRejectRequest()
  const startReview = useStartReview()
  const needsUpdate = useNeedsUpdateRequest()
  const rows = list.items
  const isInitial = list.isLoading && rows.length === 0

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <h1 className="text-h1">{t('approvals:title')}</h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/requests">{t('approvals:viewAll')}</Link>
        </Button>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <FilterChip active={tab === 'IN_REVIEW'} onClick={() => setTab('IN_REVIEW')}>
          {t('approvals:tabInReview')}
        </FilterChip>
        <FilterChip active={tab === 'NEW'} onClick={() => setTab('NEW')}>
          {t('approvals:tabNew')}
        </FilterChip>
        <FilterChip active={overdue} onClick={() => setOverdue((v) => !v)}>
          {t('approvals:chipOverdue')}
        </FilterChip>

        <Select
          value={department}
          onValueChange={(value) => setDepartment(value as Department | 'all')}
        >
          <SelectTrigger className="h-8 w-[200px]" aria-label={t('common:department.label')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common:department.all')}</SelectItem>
            {DEPARTMENT_ORDER.map((item) => (
              <SelectItem key={item} value={item}>
                {t(`common:department.${item}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortId} onValueChange={(value) => setSortId(value as SortId)}>
          <SelectTrigger className="h-8 w-[200px]" aria-label={t('approvals:sortLabel')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="waiting">{t('approvals:sort.waiting')}</SelectItem>
            <SelectItem value="newest">{t('approvals:sort.newest')}</SelectItem>
            <SelectItem value="oldest">{t('approvals:sort.oldest')}</SelectItem>
            <SelectItem value="type">{t('approvals:sort.type')}</SelectItem>
          </SelectContent>
        </Select>

        <SearchInput
          value={keyword}
          onChange={setKeyword}
          className="w-[220px]"
          placeholder={t('common:actions.search')}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
        {isInitial ? (
          <div className="space-y-1 p-3" aria-hidden>
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title={t('approvals:emptyTitle')}
            description={t('approvals:emptyDescription')}
          />
        ) : (
          <ScrollPane
            ref={setScrollRoot}
            fillParent
            label={t('approvals:title')}
            className="h-full"
          >
            <ul className="divide-y divide-border">
              {rows.map((r) => {
                const waiting = daysWaiting(r.updatedDate || r.createdDate)
                return (
                  <li
                    key={r.id}
                    className={cn(
                      'relative flex flex-wrap items-center justify-between gap-3 px-4 py-3',
                      interactiveRow,
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/requests/${r.id}`}
                        className="font-medium text-foreground transition-colors duration-fast after:absolute after:inset-0 after:content-[''] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                      >
                        {r.title}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {r.applicant.name} {r.applicant.surname}
                        {' · '}
                        {t(`common:department.${r.applicant.department}`)}
                        {' · '}
                        {r.formTypeName}
                        {' · '}
                        {t('approvals:waitingDays', { count: waiting })}
                        {' · '}
                        {formatDateTime(r.updatedDate, i18n.language)}
                      </p>
                    </div>
                    <div className="relative z-10 flex items-center gap-2">
                      <StatusBadge status={r.status} />
                      {r.status === RequestStatus.IN_REVIEW ? (
                        <>
                          <Button size="sm" onClick={() => setApproveId(r.id)}>
                            {t('common:admin.approve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setReason('')
                              setRejectId(r.id)
                            }}
                          >
                            {t('common:admin.reject')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReason('')
                              setNeedsUpdateId(r.id)
                            }}
                          >
                            {t('requests:needsUpdateTitle')}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={startReview.isPending}
                            onClick={() =>
                              void startReview
                                .mutateAsync(r.id)
                                .then(() => toast.success(t('requests:explorer.reviewStarted')))
                                .catch(() => toast.error(t('common:toast.error.conflict')))
                            }
                          >
                            {t('requests:explorer.startReview')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReason('')
                              setNeedsUpdateId(r.id)
                            }}
                          >
                            {t('requests:needsUpdateTitle')}
                          </Button>
                        </>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
            <InfiniteScroller
              canLoadMore={list.canLoadMore}
              isFetchingNextPage={list.isFetchingNextPage}
              fetchNextPage={() => void list.fetchNextPage()}
              root={scrollRoot}
              capReached={list.capReached}
              capAction={
                <Button asChild variant="outline" size="sm">
                  <Link to="/requests">{t('approvals:viewAll')}</Link>
                </Button>
              }
              skeletonHeight={56}
            />
          </ScrollPane>
        )}
      </div>

      <Dialog open={approveId != null} onOpenChange={(o) => !o && setApproveId(null)}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t('requests:approveTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('requests:approveDescription')}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveId(null)}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              onClick={async () => {
                if (approveId == null) return
                try {
                  await approve.mutateAsync(approveId)
                  toast.success(t('common:toast.success.approved'))
                  setApproveId(null)
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

      <Dialog open={rejectId != null} onOpenChange={(o) => !o && setRejectId(null)}>
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
            <Button variant="outline" onClick={() => setRejectId(null)}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (rejectId == null) return
                try {
                  await reject.mutateAsync({ id: rejectId, reason })
                  toast.success(t('common:toast.success.rejected'))
                  setRejectId(null)
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

      <Dialog open={needsUpdateId != null} onOpenChange={(o) => !o && setNeedsUpdateId(null)}>
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
            <Button variant="outline" onClick={() => setNeedsUpdateId(null)}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              onClick={async () => {
                if (needsUpdateId == null) return
                try {
                  await needsUpdate.mutateAsync({ id: needsUpdateId, reason })
                  toast.success(t('common:toast.success.saved'))
                  setNeedsUpdateId(null)
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
    </div>
  )
}
