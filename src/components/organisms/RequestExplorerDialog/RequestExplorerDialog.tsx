import { ArrowUpRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FilterChip } from '@/components/molecules/FilterChip'
import { InfiniteScroller } from '@/components/molecules/InfiniteScroller'
import { ScrollPane } from '@/components/molecules/ScrollPane'
import { SearchInput } from '@/components/molecules/SearchInput'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  useInfiniteRequests,
  type InfiniteRequestParams,
} from '@/hooks/useInfiniteRequests'
import { useRequestCounts } from '@/hooks/useRequestCounts'
import { useAuthStore } from '@/stores/authStore'
import { FormType, RequestStatus, UserRole } from '@/types/enums'
import { cn } from '@/utils/cn'
import { statusKey } from '@/utils/status'
import { ExpandableRequestRow } from './ExpandableRequestRow'

/** Which statuses the dialog starts with; chips stay free afterwards. */
export type ExplorerPreset = 'all' | 'pending' | 'approved' | 'rejected'

const PRESET_STATUSES: Record<ExplorerPreset, RequestStatus[]> = {
  all: [],
  pending: [RequestStatus.NEW, RequestStatus.IN_REVIEW],
  approved: [RequestStatus.APPROVED],
  rejected: [RequestStatus.REJECTED],
}

const SORT_OPTIONS = {
  newest: { sortBy: 'createdDate', sortOrder: 'desc' as const },
  oldest: { sortBy: 'createdDate', sortOrder: 'asc' as const },
  updated: { sortBy: 'updatedDate', sortOrder: 'desc' as const },
  status: { sortBy: 'status', sortOrder: 'asc' as const },
}

type SortKey = keyof typeof SORT_OPTIONS

const STATUS_CHIPS = Object.values(RequestStatus)
const FORM_TYPE_CHIPS = Object.values(FormType)

export interface RequestExplorerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Initial status filter; the four KPI cards feed the same dialog. */
  preset: ExplorerPreset
  /** Heading, normally the KPI label that opened it. */
  title: string
  /** Restrict to one applicant (used by the user detail page). */
  applicantId?: string
}

export function RequestExplorerDialog({
  open,
  onOpenChange,
  preset,
  title,
  applicantId,
}: RequestExplorerDialogProps) {
  const { t } = useTranslation(['requests', 'common', 'status'])
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)
  const canModerate = role === UserRole.ADMIN

  const [statuses, setStatuses] = useState<RequestStatus[]>(PRESET_STATUSES[preset])
  const [formTypes, setFormTypes] = useState<FormType[]>([])
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null)

  // Reopening from another KPI must land on that KPI's slice.
  useEffect(() => {
    if (!open) return
    setStatuses(PRESET_STATUSES[preset])
    setFormTypes([])
    setKeyword('')
    setSort('newest')
    setExpandedId(null)
  }, [open, preset])

  const params = useMemo(
    () => ({
      status: statuses.length ? statuses : undefined,
      formType: formTypes.length ? formTypes : undefined,
      keyword: keyword || undefined,
      applicantId,
      ...SORT_OPTIONS[sort],
    }),
    [statuses, formTypes, keyword, applicantId, sort],
  )

  const query = useInfiniteRequests(params, { enabled: open })
  const { items, totalItems, canLoadMore, capReached } = query

  const breakdownCounts = useRequestCounts(
    Object.fromEntries(
      FORM_TYPE_CHIPS.map((formType) => [
        formType,
        {
          status: statuses.length ? statuses : undefined,
          formType: [formType],
          keyword: keyword || undefined,
          applicantId,
        },
      ]),
    ) as Record<FormType, InfiniteRequestParams>,
    { enabled: open && preset !== 'all' },
  )
  const breakdown = FORM_TYPE_CHIPS.filter((formType) => breakdownCounts[formType] > 0)

  const clearFilters = () => {
    setStatuses([])
    setFormTypes([])
    setKeyword('')
  }

  const openDetail = (id: string) => {
    onOpenChange(false)
    navigate(`/requests/${id}`)
  }

  const deepLink = buildListLink({ statuses, formTypes, keyword, applicantId })
  const showEmpty = !query.isLoading && items.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex h-[85vh] w-full max-w-[960px] flex-col gap-0 p-0',
          'max-sm:h-dvh max-sm:max-w-none max-sm:rounded-none',
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border px-6 py-4 pr-14 text-left">
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {title}
            <span className="rounded-md bg-primary-subtle px-2 py-0.5 text-xs font-medium tabular-nums text-primary">
              {t('requests:explorer.total', { count: totalItems })}
            </span>
          </DialogTitle>
          <DialogDescription>{t('requests:explorer.description')}</DialogDescription>
        </DialogHeader>

        <div className="shrink-0 space-y-2 border-b border-border bg-card px-6 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <FilterChip active={statuses.length === 0} onClick={() => setStatuses([])}>
              {t('requests:explorer.allStatuses')}
            </FilterChip>
            {STATUS_CHIPS.map((s) => (
              <FilterChip
                key={s}
                active={statuses.includes(s)}
                onClick={() => setStatuses((prev) => toggle(prev, s))}
              >
                {t(`status:${statusKey(s)}`)}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <FilterChip active={formTypes.length === 0} onClick={() => setFormTypes([])}>
              {t('requests:explorer.allTypes')}
            </FilterChip>
            {FORM_TYPE_CHIPS.map((ft) => (
              <FilterChip
                key={ft}
                active={formTypes.includes(ft)}
                onClick={() => setFormTypes((prev) => toggle(prev, ft))}
              >
                {t(`requests:formType.${ft}`)}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput value={keyword} onChange={setKeyword} className="min-w-[200px] flex-1" />
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[190px]" aria-label={t('requests:explorer.sortLabel')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SORT_OPTIONS) as SortKey[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`requests:explorer.sort.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {preset !== 'all' && breakdown.length > 0 ? (
          <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-muted/40 px-6 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{t('requests:explorer.breakdown')}</span>
            {breakdown.map((formType) => (
              <span key={formType} className="tabular-nums">
                {t(`requests:formType.${formType}`)}:{' '}
                <strong className="text-foreground">{breakdownCounts[formType]}</strong>
              </span>
            ))}
          </div>
        ) : null}

        <ScrollPane
          fillParent
          ref={setScrollRoot}
          label={title}
          className="rounded-none"
          wrapperClassName="bg-background"
        >
          {query.isLoading ? (
            <div className="space-y-1 p-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : showEmpty ? (
            <div className="p-6">
              <EmptyState preset="noResults" onAction={clearFilters} />
            </div>
          ) : (
            <>
              <ul>
                {items.map((request) => (
                  <ExpandableRequestRow
                    key={request.id}
                    request={request}
                    expanded={expandedId === request.id}
                    onToggle={() =>
                      setExpandedId((prev) => (prev === request.id ? null : request.id))
                    }
                    canModerate={canModerate}
                    onOpenDetail={() => openDetail(request.id)}
                  />
                ))}
              </ul>
              <InfiniteScroller
                root={scrollRoot}
                canLoadMore={canLoadMore}
                capReached={capReached}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={() => void query.fetchNextPage()}
                skeletonHeight={60}
                capAction={
                  <Button variant="outline" size="sm" onClick={() => openList(navigate, deepLink, onOpenChange)}>
                    {t('common:infinite.viewAll')}
                  </Button>
                }
              />
            </>
          )}
        </ScrollPane>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-6 py-3">
          <span className="text-xs text-muted-foreground">
            {t('requests:explorer.shown', { count: items.length, total: totalItems })}
          </span>
          <Button variant="ghost" size="sm" onClick={() => openList(navigate, deepLink, onOpenChange)}>
            {t('requests:explorer.openInList')}
            <ArrowUpRight aria-hidden className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function openList(
  navigate: ReturnType<typeof useNavigate>,
  search: string,
  onOpenChange: (open: boolean) => void,
) {
  onOpenChange(false)
  navigate(`/requests${search}`)
}

/**
 * The list page carries one status and one form type in the URL, so a
 * multi-select chip state is only forwarded when it is unambiguous.
 */
function buildListLink(input: {
  statuses: RequestStatus[]
  formTypes: FormType[]
  keyword: string
  applicantId?: string
}): string {
  const params = new URLSearchParams()
  const onlyStatus = input.statuses.length === 1 ? input.statuses[0] : undefined
  const onlyFormType = input.formTypes.length === 1 ? input.formTypes[0] : undefined
  if (onlyStatus) params.set('status', onlyStatus)
  if (onlyFormType) params.set('formType', onlyFormType)
  if (input.keyword) params.set('keyword', input.keyword)
  if (input.applicantId != null) params.set('applicantId', String(input.applicantId))
  const search = params.toString()
  return search ? `?${search}` : ''
}

