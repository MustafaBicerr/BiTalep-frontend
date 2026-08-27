import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Pagination } from '@/components/molecules/Pagination'
import { SearchInput } from '@/components/molecules/SearchInput'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { DateRangePicker } from '@/components/molecules/DateRangePicker'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  useApproveRequest,
  useRejectRequest,
  useRequests,
} from '@/hooks/useRequests'
import { useAuthStore } from '@/stores/authStore'
import { FormType, RequestStatus, UserRole } from '@/types/enums'
import { formatDateTime } from '@/utils/formatDate'

export function RequestListPage() {
  const { t, i18n } = useTranslation(['requests', 'common', 'status'])
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)
  const isAdmin = role === UserRole.ADMIN

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [formType, setFormType] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selected, setSelected] = useState<number[]>([])

  const params = useMemo(
    () => ({
      page,
      pageSize,
      keyword: keyword || undefined,
      status: status === 'all' ? undefined : [status as RequestStatus],
      formType: formType === 'all' ? undefined : [formType as FormType],
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      sortBy: 'createdDate',
      sortOrder: 'desc' as const,
    }),
    [page, pageSize, keyword, status, formType, dateFrom, dateTo],
  )

  const { data, isLoading } = useRequests(params)
  const approve = useApproveRequest()
  const reject = useRejectRequest()

  const rows = data?.data ?? []
  const total = data?.meta?.totalItems ?? 0

  const resetPage = () => setPage(1)

  const clearFilters = () => {
    setKeyword('')
    setStatus('all')
    setFormType('all')
    setDateFrom('')
    setDateTo('')
    resetPage()
  }

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? rows.map((r) => r.id) : [])
  }

  const bulkApprove = async () => {
    let ok = 0
    let skipped = 0
    for (const id of selected) {
      try {
        await approve.mutateAsync(id)
        ok++
      } catch {
        skipped++
      }
    }
    setSelected([])
    toast.success(`${ok} / ${ok + skipped}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h1">{isAdmin ? t('requests:title') : t('requests:myTitle')}</h1>
        {!isAdmin ? (
          <Button asChild>
            <Link to="/requests/new">{t('requests:newTitle')}</Link>
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
        <div className="min-w-[200px] flex-1">
          <SearchInput
            value={keyword}
            onChange={(v) => {
              setKeyword(v)
              resetPage()
            }}
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v)
            resetPage()
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('common:filter.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common:filter.status')}</SelectItem>
            {Object.values(RequestStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {t(`status:${statusKey(s)}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={formType}
          onValueChange={(v) => {
            setFormType(v)
            resetPage()
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('common:filter.formType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common:filter.formType')}</SelectItem>
            {Object.values(FormType).map((ft) => (
              <SelectItem key={ft} value={ft}>
                {t(`requests:formType.${ft}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onFromChange={(v) => {
            setDateFrom(v)
            resetPage()
          }}
          onToChange={(v) => {
            setDateTo(v)
            resetPage()
          }}
        />
      </div>

      {isAdmin && selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-primary-subtle p-3">
          <span className="text-sm">{t('requests:selectedCount', { count: selected.length })}</span>
          <Button size="sm" onClick={() => void bulkApprove()}>
            {t('requests:bulkApprove')}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              for (const id of selected) {
                try {
                  await reject.mutateAsync({ id })
                } catch {
                  /* skip */
                }
              }
              setSelected([])
            }}
          >
            {t('requests:bulkReject')}
          </Button>
        </div>
      ) : null}

      {rows.length === 0 && !isLoading ? (
        <EmptyState preset="noResults" onAction={clearFilters} />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin ? (
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selected.length > 0 && selected.length === rows.length}
                        onCheckedChange={(v) => toggleAll(v === true)}
                      />
                    </TableHead>
                  ) : null}
                  <TableHead>{t('requests:table.title')}</TableHead>
                  <TableHead>{t('requests:table.type')}</TableHead>
                  <TableHead>{t('requests:table.status')}</TableHead>
                  {isAdmin ? <TableHead>{t('requests:table.applicant')}</TableHead> : null}
                  <TableHead>{t('requests:table.createdAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer"
                    data-state={selected.includes(r.id) ? 'selected' : undefined}
                    onClick={() => navigate(`/requests/${r.id}`)}
                  >
                    {isAdmin ? (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.includes(r.id)}
                          onCheckedChange={(v) =>
                            setSelected((prev) =>
                              v === true ? [...prev, r.id] : prev.filter((id) => id !== r.id),
                            )
                          }
                        />
                      </TableCell>
                    ) : null}
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell>{r.formTypeName}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    {isAdmin ? (
                      <TableCell>
                        {r.applicant.name} {r.applicant.surname}
                      </TableCell>
                    ) : null}
                    <TableCell>{formatDateTime(r.createdDate, i18n.language)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {rows.map((r) => (
              <Link
                key={r.id}
                to={`/requests/${r.id}`}
                className="block rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{r.title}</p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.formTypeName}</p>
              </Link>
            ))}
          </div>

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
