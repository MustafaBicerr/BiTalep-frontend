import { CheckCircle, Clock, FileText, XCircle, type LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { KpiCard } from '@/components/molecules/KpiCard'
import { EmptyState } from '@/components/molecules/EmptyState'
import { ChartSkeleton, KpiSkeleton, TableRowSkeleton } from '@/components/molecules/SkeletonTemplates'
import {
  RequestExplorerDialog,
  type ExplorerPreset,
} from '@/components/organisms/RequestExplorerDialog'
import {
  RequestListWidget,
  type WidgetChip,
} from '@/components/organisms/RequestListWidget'
import { Button } from '@/components/ui/button'
import { useDashboard } from '@/hooks/useDashboard'
import { useAuthStore } from '@/stores/authStore'
import { FormType, RequestStatus, UserRole } from '@/types/enums'
import type { ApplicationResponse } from '@/types/request.types'
import { formatDateTime } from '@/utils/formatDate'
import { statusKey } from '@/utils/status'

interface KpiCardConfig {
  /** `all` = admin-wide cards, `own` = personnel cards (store scopes the data). */
  scope: 'all' | 'own'
  labelKey: string
  field: 'totalRequests' | 'pendingRequests' | 'approvedRequests' | 'rejectedRequests'
  icon: LucideIcon
  tone: 'info' | 'warning' | 'success' | 'destructive'
  preset: ExplorerPreset
}

const KPI_CARDS: KpiCardConfig[] = [
  { scope: 'all', labelKey: 'totalRequests', field: 'totalRequests', icon: FileText, tone: 'info', preset: 'all' },
  { scope: 'all', labelKey: 'pendingRequests', field: 'pendingRequests', icon: Clock, tone: 'warning', preset: 'pending' },
  { scope: 'all', labelKey: 'approvedRequests', field: 'approvedRequests', icon: CheckCircle, tone: 'success', preset: 'approved' },
  { scope: 'all', labelKey: 'rejectedRequests', field: 'rejectedRequests', icon: XCircle, tone: 'destructive', preset: 'rejected' },
  { scope: 'own', labelKey: 'myTotal', field: 'totalRequests', icon: FileText, tone: 'info', preset: 'all' },
  { scope: 'own', labelKey: 'myPending', field: 'pendingRequests', icon: Clock, tone: 'warning', preset: 'pending' },
]

const STATUS_COLOR: Record<RequestStatus, string> = {
  NEW: 'var(--color-status-new)',
  IN_REVIEW: 'var(--color-status-review)',
  APPROVED: 'var(--color-status-approved)',
  REJECTED: 'var(--color-status-rejected)',
  CANCELLED: 'var(--color-status-cancelled)',
}

const RECENT_SORTS = [
  { id: 'newest', sortBy: 'createdDate', sortOrder: 'desc' as const },
  { id: 'oldest', sortBy: 'createdDate', sortOrder: 'asc' as const },
  { id: 'status', sortBy: 'status', sortOrder: 'asc' as const },
]

/** Deliberately different from the recent-requests axis: waiting time first. */
const PENDING_SORTS = [
  { id: 'waiting', sortBy: 'updatedDate', sortOrder: 'asc' as const },
  { id: 'created', sortBy: 'createdDate', sortOrder: 'desc' as const },
  { id: 'type', sortBy: 'formType', sortOrder: 'asc' as const },
]

const OVERDUE_DAYS = 3

/** Date boundaries are frozen per mount so query keys stay stable. */
function useWidgetChips() {
  const { t } = useTranslation('dashboard')

  const bounds = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000
    const isoDate = (offsetDays: number) =>
      new Date(Date.now() - offsetDays * dayMs).toISOString().slice(0, 10)
    return {
      today: isoDate(0),
      weekAgo: isoDate(6),
      overdueBefore: new Date(Date.now() - OVERDUE_DAYS * dayMs).toISOString(),
    }
  }, [])

  const recentChips: WidgetChip[] = [
    { id: 'all', label: t('widget.chip.all') },
    { id: 'today', label: t('widget.chip.today'), params: { dateFrom: bounds.today } },
    { id: 'week', label: t('widget.chip.week'), params: { dateFrom: bounds.weekAgo } },
    {
      id: 'withAttachment',
      label: t('widget.chip.withAttachment'),
      params: { hasAttachments: true },
    },
  ]

  const pendingChips: WidgetChip[] = [
    { id: 'all', label: t('widget.chip.all') },
    {
      id: 'overdue',
      label: t('widget.chip.overdue'),
      params: { updatedBefore: bounds.overdueBefore },
    },
    {
      id: 'arrivedThisWeek',
      label: t('widget.chip.arrivedThisWeek'),
      params: { dateFrom: bounds.weekAgo },
    },
    {
      id: 'critical',
      label: t('widget.chip.critical'),
      params: { formType: [FormType.LEAVE, FormType.ADVANCE] },
    },
  ]

  return { recentChips, pendingChips }
}

export function DashboardPage() {
  const { t, i18n } = useTranslation(['dashboard', 'status', 'common'])
  const role = useAuthStore((s) => s.user?.role)
  const { data, isLoading, isError, refetch } = useDashboard()
  const isAdmin = role === UserRole.ADMIN
  const [drilldown, setDrilldown] = useState<{ preset: ExplorerPreset; title: string } | null>(null)
  const { recentChips, pendingChips } = useWidgetChips()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: isAdmin ? 4 : 2 }).map((_, i) => (
            <KpiSkeleton key={i} />
          ))}
        </div>
        <TableRowSkeleton />
        <ChartSkeleton />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <EmptyState
        title={t('common:toast.error.generic')}
        actionLabel={t('common:actions.retry')}
        onAction={() => void refetch()}
      />
    )
  }

  const chartData = data.statusDistribution.map((s) => ({
    name: t(`status:${statusKey(s.status)}`),
    count: s.count,
    fill: STATUS_COLOR[s.status],
  }))

  const trendData = (data.weeklyTrend ?? []).map((p) => ({
    ...p,
    label: p.date.slice(5),
  }))

  const requestMeta = (request: ApplicationResponse) =>
    `${request.formTypeName} · ${formatDateTime(request.createdDate, i18n.language)}`

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h1">{t('dashboard:title')}</h1>
        {!isAdmin ? (
          <Button asChild>
            <Link to="/requests/new">{t('dashboard:newRequestCta')}</Link>
          </Button>
        ) : null}
      </div>

      <div className={`grid gap-4 ${isAdmin ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2'}`}>
        {KPI_CARDS.filter((card) => (isAdmin ? card.scope !== 'own' : card.scope !== 'all')).map(
          (card) => {
            const label = t(`dashboard:${card.labelKey}`)
            return (
              <KpiCard
                key={card.labelKey}
                label={label}
                value={data[card.field]}
                icon={card.icon}
                tone={card.tone}
                onClick={() => setDrilldown({ preset: card.preset, title: label })}
              />
            )
          },
        )}
      </div>

      {isAdmin && (data.overduePendingCount ?? 0) > 0 ? (
        <p className="text-sm text-muted-foreground">
          <span className="rounded-md bg-[color:var(--color-warning)]/15 px-2 py-1 font-medium text-foreground">
            {t('dashboard:overduePending', { count: data.overduePendingCount })}
          </span>
        </p>
      ) : null}

      <div className={`grid items-start gap-6 ${isAdmin ? 'xl:grid-cols-[3fr_2fr]' : ''}`}>
        <RequestListWidget
          title={t('dashboard:recentRequests')}
          baseParams={{}}
          chips={recentChips}
          sorts={RECENT_SORTS.map((s) => ({ ...s, label: t(`dashboard:widget.sort.${s.id}`) }))}
          visibleRows={10}
          emptyText={t('dashboard:noRequestsYet')}
          renderMeta={requestMeta}
          headerAction={
            isAdmin ? (
              <span className="rounded-md bg-primary-subtle px-2 py-1 text-xs font-medium text-primary">
                {t('dashboard:todayRequests')}: {data.todayRequests}
              </span>
            ) : undefined
          }
        />

        {isAdmin ? (
          <div className="space-y-6">
            <RequestListWidget
              title={t('dashboard:pendingApprovals')}
              baseParams={{ status: [RequestStatus.IN_REVIEW] }}
              chips={pendingChips}
              sorts={PENDING_SORTS.map((s) => ({ ...s, label: t(`dashboard:widget.sort.${s.id}`) }))}
              visibleRows={6}
              emptyText={t('dashboard:noPendingApprovals')}
              renderMeta={requestMeta}
              headerAction={
                <Button asChild variant="ghost" size="sm">
                  <Link to="/approvals">{t('dashboard:viewApprovals')}</Link>
                </Button>
              }
            />

            <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h2 className="mb-4 text-h3">{t('dashboard:weeklyTrend')}</h2>
              <div className="h-[180px] w-full" aria-label={t('dashboard:weeklyTrend')}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }} />
                    <YAxis allowDecimals={false} width={28} tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h2 className="mb-4 text-h3">{t('dashboard:statusDistribution')}</h2>
              <div className="h-[240px] w-full" aria-label={t('dashboard:statusDistribution')}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        ) : null}
      </div>

      <RequestExplorerDialog
        open={drilldown != null}
        onOpenChange={(open) => !open && setDrilldown(null)}
        preset={drilldown?.preset ?? 'all'}
        title={drilldown?.title ?? t('dashboard:title')}
      />
    </div>
  )
}
