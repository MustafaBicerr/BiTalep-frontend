import { CheckCircle, Clock, FileText, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { KpiCard } from '@/components/molecules/KpiCard'
import { EmptyState } from '@/components/molecules/EmptyState'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { ChartSkeleton, KpiSkeleton, TableRowSkeleton } from '@/components/molecules/SkeletonTemplates'
import { Button } from '@/components/ui/button'
import { useDashboard } from '@/hooks/useDashboard'
import { useAuthStore } from '@/stores/authStore'
import { RequestStatus, UserRole } from '@/types/enums'
import { formatDateTime } from '@/utils/formatDate'
import { useTranslation as useLang } from 'react-i18next'

const STATUS_COLOR: Record<RequestStatus, string> = {
  NEW: 'var(--color-status-new)',
  IN_REVIEW: 'var(--color-status-review)',
  APPROVED: 'var(--color-status-approved)',
  REJECTED: 'var(--color-status-rejected)',
  CANCELLED: 'var(--color-status-cancelled)',
}

export function DashboardPage() {
  const { t, i18n } = useTranslation(['dashboard', 'status', 'common'])
  useLang()
  const role = useAuthStore((s) => s.user?.role)
  const { data, isLoading, isError, refetch } = useDashboard()
  const isAdmin = role === UserRole.ADMIN

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
        {isAdmin ? (
          <>
            <KpiCard label={t('dashboard:totalRequests')} value={data.totalRequests} icon={FileText} tone="info" />
            <KpiCard label={t('dashboard:pendingRequests')} value={data.pendingRequests} icon={Clock} tone="warning" />
            <KpiCard label={t('dashboard:approvedRequests')} value={data.approvedRequests} icon={CheckCircle} tone="success" />
            <KpiCard label={t('dashboard:rejectedRequests')} value={data.rejectedRequests} icon={XCircle} tone="destructive" />
          </>
        ) : (
          <>
            <KpiCard label={t('dashboard:myTotal')} value={data.totalRequests} icon={FileText} tone="info" />
            <KpiCard label={t('dashboard:myPending')} value={data.pendingRequests} icon={Clock} tone="warning" />
          </>
        )}
      </div>

      <div className={`grid gap-6 ${isAdmin ? 'xl:grid-cols-[3fr_2fr]' : ''}`}>
        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-h3">{t('dashboard:recentRequests')}</h2>
            {isAdmin ? (
              <span className="rounded-md bg-primary-subtle px-2 py-1 text-xs font-medium text-primary">
                {t('dashboard:todayRequests')}: {data.todayRequests}
              </span>
            ) : null}
          </div>
          {data.recentRequests.length === 0 ? (
            <EmptyState preset="noRequests" onAction={() => undefined} />
          ) : (
            <ul className="divide-y divide-border">
              {data.recentRequests.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/requests/${r.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 hover:bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(r.createdDate, i18n.language)}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {isAdmin ? (
          <div className="space-y-6">
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
    </div>
  )
}

function statusKey(status: RequestStatus) {
  switch (status) {
    case RequestStatus.NEW:
      return 'new'
    case RequestStatus.IN_REVIEW:
      return 'inReview'
    case RequestStatus.APPROVED:
      return 'approved'
    case RequestStatus.REJECTED:
      return 'rejected'
    case RequestStatus.CANCELLED:
      return 'cancelled'
  }
}
