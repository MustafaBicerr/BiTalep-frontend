import { differenceInCalendarMonths } from 'date-fns'
import { Check, CreditCard } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { EmptyState } from '@/components/molecules/EmptyState'
import { CardSkeleton, ChartSkeleton, FormFieldSkeleton } from '@/components/molecules/SkeletonTemplates'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCompany } from '@/hooks/useCompany'
import { useRequestCounts } from '@/hooks/useRequestCounts'
import { useUsers } from '@/hooks/useUsers'
import { queryKeys } from '@/lib/queryClient'
import { userService } from '@/services/userService'
import { DEPARTMENT_ORDER } from '@/types/enums'
import { DEPARTMENT_COLORS } from '@/utils/department'
import { formatDate } from '@/utils/formatDate'
import { useQueries } from '@tanstack/react-query'

const BENEFITS = [
  'benefitUnlimitedPersonnel',
  'benefitApprovals',
  'benefitPriority',
] as const

export function CompanyInfoPage() {
  const { t, i18n } = useTranslation(['company', 'common'])
  const { data, isLoading } = useCompany()

  if (isLoading || !data) {
    return (
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <FormFieldSkeleton />
      </div>
    )
  }

  return (
    <section className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="text-h3">{t('company:info')}</h2>
      <dl className="grid gap-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">{t('company:name')}</dt>
          <dd className="mt-1 text-lg font-semibold tracking-tight">{data.name}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t('company:plan')}</dt>
          <dd className="mt-1">
            <Badge variant="default">{t('company:planPro')}</Badge>
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-muted-foreground">{t('company:createdAt')}</dt>
          <dd className="mt-1 text-sm">{formatDate(data.createdDate, i18n.language)}</dd>
        </div>
      </dl>
    </section>
  )
}

export function CompanySummaryPage() {
  const { t } = useTranslation(['company', 'common'])
  const { data: company, isLoading: companyLoading } = useCompany()
  const personnel = useUsers({ page: 1, pageSize: 1 })
  const requestCounts = useRequestCounts({ total: {} })

  const deptQueries = useQueries({
    queries: DEPARTMENT_ORDER.map((department) => ({
      queryKey: queryKeys.users({ page: 1, pageSize: 1, department }),
      queryFn: () => userService.list({ page: 1, pageSize: 1, department }),
    })),
  })

  const departmentChart = useMemo(
    () =>
      DEPARTMENT_ORDER.map((department, index) => ({
        department,
        name: t(`common:department.${department}`),
        count: deptQueries[index]?.data?.meta?.totalItems ?? 0,
        fill: DEPARTMENT_COLORS[department],
      })),
    [deptQueries, t],
  )

  const totalRequests = requestCounts.total
  const personnelTotal = personnel.data?.meta?.totalItems ?? 0
  const months = Math.max(
    1,
    company ? differenceInCalendarMonths(new Date(), new Date(company.createdDate)) : 1,
  )
  const avgMonthly = totalRequests / months
  const avgYearly = avgMonthly * 12

  if (companyLoading || personnel.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <CardSkeleton className="h-[88px]" />
          <CardSkeleton className="h-[88px]" />
        </div>
        <ChartSkeleton />
      </div>
    )
  }

  const metrics = [
    { key: 'personnelTotal', value: personnelTotal },
    { key: 'requestTotal', value: totalRequests },
    { key: 'avgMonthly', value: avgMonthly },
    { key: 'avgYearly', value: avgYearly },
  ] as const

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.key} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{t(`company:${metric.key}`)}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
              {Number.isInteger(metric.value)
                ? metric.value
                : metric.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-h3">{t('company:departmentBreakdown')}</h3>
        <div className="h-[240px] w-full overflow-hidden" aria-label={t('company:departmentBreakdown')} role="img">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={departmentChart} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid stroke="var(--color-border)" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
              />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {departmentChart.map((entry) => (
                  <Cell key={entry.department} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

export function CompanyMembershipPage() {
  const { t } = useTranslation('company')

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {t('selected')}
            </p>
            <h2 className="text-h1 tracking-tight">{t('membershipTitle')}</h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{t('membershipLead')}</p>
          </div>
          <Badge variant="default" className="px-3 py-1 text-sm">
            {t('planPro')}
          </Badge>
        </div>

        <div className="mt-8">
          <h3 className="mb-4 text-sm font-medium">{t('benefitsTitle')}</h3>
          <ul className="space-y-3">
            {BENEFITS.map((key) => (
              <li key={key} className="flex items-start gap-3 text-sm leading-relaxed">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-8 shadow-sm">
        <h2 className="mb-4 text-h3">{t('paymentTitle')}</h2>
        <EmptyState
          icon={CreditCard}
          title={t('paymentEmptyTitle')}
          description={t('paymentEmptyDescription')}
          className="min-h-[160px] py-6"
        />
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Button type="button" disabled>
            {t('addPayment')}
          </Button>
          <Badge variant="muted">{t('comingSoon')}</Badge>
        </div>
      </section>
    </div>
  )
}
