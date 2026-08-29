import { Download, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ApplicantFilter } from '@/components/molecules/ApplicantFilter'
import { DateRangePicker } from '@/components/molecules/DateRangePicker'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FilterChip } from '@/components/molecules/FilterChip'
import { ChartSkeleton, KpiSkeleton } from '@/components/molecules/SkeletonTemplates'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { cacheTimes, queryKeys } from '@/lib/queryClient'
import { reportService, type ExportLabels } from '@/services/reportService'
import { DEPARTMENT_ORDER, Department, FormType, RequestStatus } from '@/types/enums'
import type { RequestListParams } from '@/types/request.types'
import { cn } from '@/utils/cn'
import { DEPARTMENT_COLORS } from '@/utils/department'
import { formatDate } from '@/utils/formatDate'
import { statusKey } from '@/utils/status'

type DatePreset = 'thisMonth' | 'lastMonth' | 'last3Months' | 'thisYear' | 'custom'
type Scope = 'company' | 'department' | 'person'

const DATE_PRESETS: DatePreset[] = ['thisMonth', 'lastMonth', 'last3Months', 'thisYear', 'custom']
const SCOPES: Scope[] = ['company', 'department', 'person']
const SAMPLE_SIZE = 10

const STATUS_COLOR: Record<RequestStatus, string> = {
  NEW: 'var(--color-status-new)',
  IN_REVIEW: 'var(--color-status-review)',
  APPROVED: 'var(--color-status-approved)',
  REJECTED: 'var(--color-status-rejected)',
  CANCELLED: 'var(--color-status-cancelled)',
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function rangeForPreset(preset: Exclude<DatePreset, 'custom'>) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  switch (preset) {
    case 'thisMonth':
      return { from: isoDate(new Date(year, month, 1)), to: isoDate(new Date(year, month + 1, 0)) }
    case 'lastMonth':
      return { from: isoDate(new Date(year, month - 1, 1)), to: isoDate(new Date(year, month, 0)) }
    case 'last3Months':
      return { from: isoDate(new Date(year, month - 2, 1)), to: isoDate(new Date(year, month + 1, 0)) }
    case 'thisYear':
      return { from: isoDate(new Date(year, 0, 1)), to: isoDate(new Date(year, 11, 31)) }
  }
}

export function ReportsPage() {
  const { t, i18n } = useTranslation(['reports', 'requests', 'status', 'common'])
  const navigate = useNavigate()

  const [datePreset, setDatePreset] = useState<DatePreset>('thisMonth')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [scope, setScope] = useState<Scope>('company')
  const [departments, setDepartments] = useState<Department[]>([])
  const [applicantId, setApplicantId] = useState<string | undefined>()
  const [statuses, setStatuses] = useState<RequestStatus[]>([])
  const [formTypes, setFormTypes] = useState<FormType[]>([])
  const [busy, setBusy] = useState(false)

  const params = useMemo<Omit<RequestListParams, 'page' | 'pageSize'>>(() => {
    const range = datePreset === 'custom' ? { from: customFrom, to: customTo } : rangeForPreset(datePreset)
    return {
      dateFrom: range.from || undefined,
      dateTo: range.to || undefined,
      applicantId: scope === 'person' ? applicantId : undefined,
      department: scope === 'department' && departments.length ? departments : undefined,
      status: statuses.length ? statuses : undefined,
      formType: formTypes.length ? formTypes : undefined,
      sortBy: 'createdDate',
      sortOrder: 'desc',
    }
  }, [datePreset, customFrom, customTo, scope, applicantId, departments, statuses, formTypes])

  const debouncedParams = useDebouncedValue(params, 300)
  const ready = scope !== 'person' || applicantId != null

  const query = useQuery({
    queryKey: queryKeys.report(debouncedParams),
    queryFn: () => reportService.collect(debouncedParams),
    enabled: ready,
    // Filter tweaks keep the previous preview on screen instead of flashing skeletons.
    placeholderData: keepPreviousData,
    ...cacheTimes.report,
  })

  const labels = useMemo<ExportLabels>(
    () => ({
      status: (status) => t(`status:${statusKey(status)}`),
      formType: (formType) => t(`requests:formType.${formType}`),
      department: (department) => t(`common:department.${department}`),
      sheets: {
        requests: t('reports:sheets.requests'),
        summary: t('reports:sheets.summary'),
        departments: t('reports:sheets.departments'),
      },
      columns: {
        id: t('reports:columns.id'),
        title: t('reports:columns.title'),
        formType: t('reports:columns.formType'),
        status: t('reports:columns.status'),
        applicant: t('reports:columns.applicant'),
        department: t('reports:columns.department'),
        createdDate: t('reports:columns.createdDate'),
        updatedDate: t('reports:columns.updatedDate'),
      },
      metrics: {
        metric: t('reports:metric'),
        value: t('reports:value'),
        total: t('reports:total'),
        approved: t('reports:approved'),
        rejected: t('reports:rejected'),
        pending: t('reports:pending'),
        approvalRate: t('reports:approvalRate'),
      },
      counts: { name: t('reports:name'), count: t('reports:count') },
    }),
    [t],
  )

  const toggle = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value]

  const resetFilters = () => {
    setDatePreset('thisMonth')
    setCustomFrom('')
    setCustomTo('')
    setScope('company')
    setDepartments([])
    setApplicantId(undefined)
    setStatuses([])
    setFormTypes([])
  }

  const runExport = async () => {
    setBusy(true)
    try {
      const data = query.data ?? (await reportService.collect(debouncedParams))
      if (data.rows.length === 0) {
        toast.message(t('reports:emptyWarning'))
        return
      }
      await reportService.exportToExcel(data, labels)
      toast.success(t('reports:success'))
    } catch {
      toast.error(t('common:toast.error.generic'))
    } finally {
      setBusy(false)
    }
  }

  const data = query.data
  const departmentChart = (data?.byDepartment ?? []).map((entry) => ({
    name: t(`common:department.${entry.department}`),
    count: entry.count,
    fill: DEPARTMENT_COLORS[entry.department],
  }))
  const statusChart = (data?.byStatus ?? []).map((entry) => ({
    name: t(`status:${statusKey(entry.status)}`),
    count: entry.count,
    fill: STATUS_COLOR[entry.status],
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1">{t('reports:title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('reports:subtitle')}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="h-fit space-y-5 rounded-lg border border-border bg-card p-4 shadow-sm xl:sticky xl:top-6">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">{t('reports:period')}</legend>
            <div className="flex flex-wrap gap-2">
              {DATE_PRESETS.map((preset) => (
                <FilterChip
                  key={preset}
                  active={datePreset === preset}
                  onClick={() => setDatePreset(preset)}
                >
                  {t(`reports:presets.${preset}`)}
                </FilterChip>
              ))}
            </div>
            {datePreset === 'custom' ? (
              <DateRangePicker
                className="mt-3"
                from={customFrom}
                to={customTo}
                onFromChange={setCustomFrom}
                onToChange={setCustomTo}
              />
            ) : null}
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">{t('reports:scope')}</legend>
            <div className="flex flex-wrap gap-2">
              {SCOPES.map((option) => (
                <FilterChip key={option} active={scope === option} onClick={() => setScope(option)}>
                  {t(`reports:scopes.${option}`)}
                </FilterChip>
              ))}
            </div>

            {scope === 'department' ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {DEPARTMENT_ORDER.map((department) => (
                  <FilterChip
                    key={department}
                    active={departments.includes(department)}
                    onClick={() => setDepartments((prev) => toggle(prev, department))}
                  >
                    {t(`common:department.${department}`)}
                  </FilterChip>
                ))}
              </div>
            ) : null}

            {scope === 'person' ? (
              <div className="mt-3 space-y-2">
                <ApplicantFilter value={applicantId} onChange={setApplicantId} />
                {applicantId == null ? (
                  <p className="text-xs text-muted-foreground">{t('reports:selectPersonHint')}</p>
                ) : null}
              </div>
            ) : null}
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">{t('reports:status')}</legend>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={statuses.length === 0} onClick={() => setStatuses([])}>
                {t('reports:allStatuses')}
              </FilterChip>
              {Object.values(RequestStatus).map((status) => (
                <FilterChip
                  key={status}
                  active={statuses.includes(status)}
                  onClick={() => setStatuses((prev) => toggle(prev, status))}
                >
                  {t(`status:${statusKey(status)}`)}
                </FilterChip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">{t('reports:formType')}</legend>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={formTypes.length === 0} onClick={() => setFormTypes([])}>
                {t('reports:allFormTypes')}
              </FilterChip>
              {Object.values(FormType).map((formType) => (
                <FilterChip
                  key={formType}
                  active={formTypes.includes(formType)}
                  onClick={() => setFormTypes((prev) => toggle(prev, formType))}
                >
                  {t(`requests:formType.${formType}`)}
                </FilterChip>
              ))}
            </div>
          </fieldset>

          <div className="flex items-center gap-2 border-t border-border pt-4">
            <Button
              type="button"
              className="flex-1"
              onClick={() => void runExport()}
              disabled={busy || !ready}
            >
              <Download className="mr-2 h-4 w-4" />
              {busy ? t('reports:downloading') : t('reports:download')}
            </Button>
            <Button type="button" variant="ghost" onClick={resetFilters}>
              <RotateCcw className="mr-2 h-4 w-4" />
              {t('reports:reset')}
            </Button>
          </div>
        </aside>

        <section
          className={cn(
            'space-y-4 transition-opacity duration-fast',
            query.isPlaceholderData && 'opacity-60',
          )}
          aria-live="polite"
          aria-busy={query.isFetching}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-h3">{t('reports:preview')}</h2>
            {data ? (
              <span className="text-sm text-muted-foreground">
                {t('reports:recordCount', { count: data.summary.total })}
              </span>
            ) : null}
          </div>

          {!ready ? (
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <EmptyState preset="noResults" description={t('reports:selectPersonHint')} />
            </div>
          ) : query.isLoading ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <KpiSkeleton key={index} />
                ))}
              </div>
              <ChartSkeleton />
            </div>
          ) : data == null || data.summary.total === 0 ? (
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <EmptyState preset="noResults" description={t('reports:emptyWarning')} />
            </div>
          ) : (
            <>
              {data.truncated ? (
                <p className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground">
                  {t('reports:truncatedWarning')}
                </p>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {(
                  [
                    { key: 'total', value: data.summary.total },
                    { key: 'approved', value: data.summary.approved },
                    { key: 'rejected', value: data.summary.rejected },
                    { key: 'pending', value: data.summary.pending },
                    { key: 'approvalRate', value: `${data.summary.approvalRate}%` },
                  ] as const
                ).map((metric) => (
                  <div
                    key={metric.key}
                    className="rounded-lg border border-border bg-card p-3 shadow-sm"
                  >
                    <p className="text-xs text-muted-foreground">{t(`reports:${metric.key}`)}</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 2xl:grid-cols-2">
                <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
                  <h3 className="mb-4 text-h3">{t('reports:departmentBreakdown')}</h3>
                  <div
                    className="h-[240px] w-full"
                    aria-label={t('reports:departmentBreakdown')}
                    role="img"
                  >
                    <ResponsiveContainer width="100%" height="100%">
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
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
                  <h3 className="mb-4 text-h3">{t('reports:statusBreakdown')}</h3>
                  <div
                    className="h-[240px] w-full"
                    aria-label={t('reports:statusBreakdown')}
                    role="img"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusChart}>
                        <CartesianGrid stroke="var(--color-border)" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
                        />
                        <YAxis
                          allowDecimals={false}
                          width={32}
                          tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
                        />
                        <Tooltip />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {statusChart.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>

              <section className="rounded-lg border border-border bg-card shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                  <h3 className="text-h3">{t('reports:sampleRows')}</h3>
                  <p className="text-xs text-muted-foreground">{t('reports:sampleHint')}</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('reports:columns.title')}</TableHead>
                      <TableHead>{t('reports:columns.applicant')}</TableHead>
                      <TableHead>{t('reports:columns.department')}</TableHead>
                      <TableHead>{t('reports:columns.status')}</TableHead>
                      <TableHead>{t('reports:columns.createdDate')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.rows.slice(0, SAMPLE_SIZE).map((row) => (
                      <TableRow
                        key={row.id}
                        interactive
                        onClick={() => navigate(`/requests/${row.id}`)}
                      >
                        <TableCell className="max-w-[280px] truncate font-medium">
                          {row.title}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {row.applicant.name} {row.applicant.surname}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {t(`common:department.${row.applicant.department}`)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={row.status} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(row.createdDate, i18n.language)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </section>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
