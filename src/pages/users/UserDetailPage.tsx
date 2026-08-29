import { ArrowLeft, Copy, ListFilter, Mail, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { DepartmentBadge } from '@/components/molecules/DepartmentBadge'
import { EmptyState } from '@/components/molecules/EmptyState'
import { InfiniteScroller } from '@/components/molecules/InfiniteScroller'
import { RoleBadge } from '@/components/molecules/RoleBadge'
import { ScrollPane } from '@/components/molecules/ScrollPane'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import {
  RequestExplorerDialog,
  type ExplorerPreset,
} from '@/components/organisms/RequestExplorerDialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useInfiniteRequests } from '@/hooks/useInfiniteRequests'
import { useRequestCounts } from '@/hooks/useRequestCounts'
import { useSetUserActive, useUpdateUserRole, useUser } from '@/hooks/useUser'
import { useAuthStore } from '@/stores/authStore'
import { RequestStatus, UserRole } from '@/types/enums'
import { cn } from '@/utils/cn'
import { formatDate, formatDateTime } from '@/utils/formatDate'
import { activateOnKey, interactiveTile } from '@/utils/interactive'

/** 10 rows visible (plus the header) before the request table starts scrolling. */
const VISIBLE_ROWS = 10
const ROW_HEIGHT = 41
const HEADER_HEIGHT = 44

const SORTS = [
  { id: 'newest', sortBy: 'createdDate', sortOrder: 'desc' as const },
  { id: 'oldest', sortBy: 'createdDate', sortOrder: 'asc' as const },
  { id: 'updated', sortBy: 'updatedDate', sortOrder: 'desc' as const },
  { id: 'status', sortBy: 'status', sortOrder: 'asc' as const },
]

type MetricId = 'total' | 'pending' | 'approved' | 'rejected'

const METRICS: Array<{ id: MetricId; preset: ExplorerPreset }> = [
  { id: 'total', preset: 'all' },
  { id: 'pending', preset: 'pending' },
  { id: 'approved', preset: 'approved' },
  { id: 'rejected', preset: 'rejected' },
]

export function UserDetailPage() {
  const { t, i18n } = useTranslation(['common', 'requests', 'status'])
  const navigate = useNavigate()
  const params = useParams()
  const userId = params.id ?? ''
  const currentUser = useAuthStore((s) => s.user)
  const isAdmin = currentUser?.role === UserRole.ADMIN

  const [sortId, setSortId] = useState(SORTS[0]?.id ?? 'newest')
  const [drilldown, setDrilldown] = useState<{ preset: ExplorerPreset; title: string } | null>(null)
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null)
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [visibleRows, setVisibleRows] = useState(VISIBLE_ROWS)
  const [pastSectionEl, setPastSectionEl] = useState<HTMLElement | null>(null)

  const { data: user, isLoading, isError } = useUser(userId)
  const updateRole = useUpdateUserRole()
  const setActive = useSetUserActive()
  const sort = SORTS.find((s) => s.id === sortId) ?? SORTS[0]

  const countBuckets = useMemo(
    () => ({
      total: { applicantId: userId },
      pending: { applicantId: userId, status: [RequestStatus.NEW, RequestStatus.IN_REVIEW, RequestStatus.NEEDS_UPDATE] },
      approved: { applicantId: userId, status: [RequestStatus.APPROVED] },
      rejected: { applicantId: userId, status: [RequestStatus.REJECTED] },
    }),
    [userId],
  )
  const counts = useRequestCounts(countBuckets, {
    enabled: isAdmin && Boolean(userId),
  })

  const requests = useInfiniteRequests(
    { applicantId: userId, sortBy: sort?.sortBy, sortOrder: sort?.sortOrder },
    { enabled: isAdmin && Boolean(userId) },
  )

  useEffect(() => {
    const measure = () => {
      const top = pastSectionEl?.getBoundingClientRect().top ?? 280
      const available = window.innerHeight - top - 88
      const rows = Math.max(5, Math.floor((available - HEADER_HEIGHT) / ROW_HEIGHT))
      setVisibleRows(rows)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [pastSectionEl, requests.totalItems])

  if (!isAdmin) {
    return <EmptyState title={t('common:toast.error.forbidden')} />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[140px] w-full rounded-lg" />
        <Skeleton className="h-[360px] w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !user) {
    return (
      <EmptyState
        preset="noUsers"
        actionLabel={t('common:actions.back')}
        onAction={() => navigate('/users')}
      />
    )
  }

  const fullName = `${user.name} ${user.surname}`
  const initials = `${user.name.charAt(0)}${user.surname.charAt(0)}`.toUpperCase()

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(user.email)
      toast.success(t('common:toast.success.copied'))
    } catch {
      toast.error(t('common:toast.error.generic'))
    }
  }

  const changeRole = async (role: UserRole) => {
    try {
      await updateRole.mutateAsync({ id: user.id, role })
      toast.success(t('common:toast.success.saved'))
      setPendingRole(null)
    } catch {
      toast.error(t('common:toast.error.generic'))
    }
  }

  const deactivate = async () => {
    try {
      await setActive.mutateAsync({ id: user.id, active: false })
      toast.success(t('common:toast.success.saved'))
      setDeactivateOpen(false)
      navigate('/users', { replace: true })
    } catch {
      toast.error(t('common:toast.error.generic'))
    }
  }

  const openDrilldown = (metricId: MetricId, preset: ExplorerPreset) =>
    setDrilldown({
      preset,
      title: `${fullName} — ${t(`common:users.metrics.${metricId}`)}`,
    })

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/users">
          <ArrowLeft aria-hidden className="mr-1 h-4 w-4" />
          {t('common:users.backToList')}
        </Link>
      </Button>

      <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span
              aria-hidden
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-base font-semibold text-primary"
            >
              {initials}
            </span>
            <div className="min-w-0 space-y-1.5">
              <h1 className="truncate text-h2">{fullName}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <RoleBadge role={user.role} />
                <DepartmentBadge department={user.department} />
              </div>
              <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <Mail aria-hidden className="h-3.5 w-3.5" />
                <span className="truncate">{user.email}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  aria-label={t('common:users.copyEmail')}
                  onClick={() => void copyEmail()}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </p>
              <p className="text-xs text-muted-foreground">
                {t('common:users.createdAt')}: {formatDate(user.createdDate, i18n.language)}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {METRICS.map((metric) => {
                const label = t(`common:users.metrics.${metric.id}`)
                return (
                  <div
                    key={metric.id}
                    role="button"
                    tabIndex={0}
                    aria-haspopup="dialog"
                    aria-label={label}
                    onClick={() => openDrilldown(metric.id, metric.preset)}
                    onKeyDown={activateOnKey(() => openDrilldown(metric.id, metric.preset))}
                    className={cn(
                      'min-w-[86px] rounded-md border border-border bg-background px-3 py-2',
                      interactiveTile,
                    )}
                  >
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold tabular-nums text-foreground">
                      {counts[metric.id]}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/requests?applicantId=${user.id}`}>
                  <ListFilter aria-hidden className="mr-1 h-4 w-4" />
                  {t('common:users.filterRequests')}
                </Link>
              </Button>
              <Select
                value={user.role}
                disabled={updateRole.isPending || user.id === currentUser?.id}
                onValueChange={(value) => {
                  const next = value as UserRole
                  if (next === user.role) return
                  setPendingRole(next)
                }}
              >
                <SelectTrigger className="h-8 w-[170px]" aria-label={t('common:users.changeRole')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.ADMIN}>{t('common:role.admin')}</SelectItem>
                  <SelectItem value={UserRole.PERSONEL}>{t('common:role.employee')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={setPastSectionEl}
        className="rounded-lg border border-border bg-card p-4 shadow-sm"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-h3">
            {t('common:users.pastRequests')}
            <span className="rounded-md bg-primary-subtle px-2 py-0.5 text-xs font-medium tabular-nums text-primary">
              {requests.totalItems}
            </span>
          </h2>
          <Select value={sort?.id} onValueChange={setSortId}>
            <SelectTrigger className="h-8 w-[190px]" aria-label={t('requests:explorer.sortLabel')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {t(`requests:explorer.sort.${option.id}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {requests.isLoading ? (
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : requests.items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('common:users.noRequests')}
          </p>
        ) : (
          <ScrollPane
            ref={setScrollRoot}
            maxHeight={HEADER_HEIGHT + visibleRows * ROW_HEIGHT}
            label={t('common:users.pastRequests')}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('requests:table.title')}</TableHead>
                  <TableHead>{t('requests:table.type')}</TableHead>
                  <TableHead>{t('requests:table.status')}</TableHead>
                  <TableHead>{t('requests:table.createdAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.items.map((request) => (
                  <TableRow
                    key={request.id}
                    interactive
                    onClick={() => navigate(`/requests/${request.id}`)}
                  >
                    <TableCell className="font-medium">{request.title}</TableCell>
                    <TableCell>{request.formTypeName}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(request.createdDate, i18n.language)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <InfiniteScroller
              root={scrollRoot}
              canLoadMore={requests.canLoadMore}
              capReached={requests.capReached}
              isFetchingNextPage={requests.isFetchingNextPage}
              fetchNextPage={() => void requests.fetchNextPage()}
              skeletonRows={2}
              skeletonHeight={ROW_HEIGHT - 4}
              capAction={
                <Button asChild variant="outline" size="sm">
                  <Link to={`/requests?applicantId=${user.id}`}>{t('common:infinite.viewAll')}</Link>
                </Button>
              }
            />
          </ScrollPane>
        )}
      </section>

      {user.id !== currentUser?.id ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeactivateOpen(true)}
          >
            <Trash2 aria-hidden className="mr-1 h-4 w-4" />
            {t('common:users.remove')}
          </Button>
        </div>
      ) : null}

      <RequestExplorerDialog
        open={drilldown != null}
        onOpenChange={(open) => !open && setDrilldown(null)}
        preset={drilldown?.preset ?? 'all'}
        title={drilldown?.title ?? fullName}
        applicantId={user.id}
      />

      <ConfirmDialog
        open={pendingRole != null}
        onOpenChange={(open) => {
          if (!open) setPendingRole(null)
        }}
        title={t('common:users.roleConfirmTitle')}
        description={t('common:users.roleConfirmDescription', {
          role:
            pendingRole === UserRole.ADMIN
              ? t('common:role.admin')
              : t('common:role.employee'),
        })}
        loading={updateRole.isPending}
        onConfirm={() => {
          if (pendingRole) void changeRole(pendingRole)
        }}
      />

      <ConfirmDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title={t('common:users.removeConfirmTitle')}
        description={t('common:users.removeConfirmDescription', { name: fullName })}
        confirmLabel={t('common:users.remove')}
        destructive
        loading={setActive.isPending}
        onConfirm={() => {
          void deactivate()
        }}
      />
    </div>
  )
}
