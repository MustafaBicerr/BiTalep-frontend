import { requestService } from '@/services/requestService'
import { DEPARTMENT_ORDER, RequestStatus } from '@/types/enums'
import type { Department, FormType } from '@/types/enums'
import type { ApplicationResponse, RequestListParams } from '@/types/request.types'

/** Server page size while collecting; the seed can exceed a single page. */
const COLLECT_PAGE_SIZE = 100
/** Safety valve so a runaway filter cannot loop forever. */
const MAX_COLLECT_PAGES = 20

export interface ReportSummary {
  total: number
  approved: number
  rejected: number
  pending: number
  approvalRate: number
}

export interface ReportData {
  rows: ApplicationResponse[]
  summary: ReportSummary
  byStatus: Array<{ status: RequestStatus; count: number }>
  byFormType: Array<{ formType: FormType; count: number }>
  byDepartment: Array<{ department: Department; count: number }>
  /** True when the page cap stopped collection before the last page. */
  truncated: boolean
}

export function summarize(rows: ApplicationResponse[]): ReportSummary {
  const approved = rows.filter((r) => r.status === RequestStatus.APPROVED).length
  const rejected = rows.filter((r) => r.status === RequestStatus.REJECTED).length
  const decided = approved + rejected
  return {
    total: rows.length,
    approved,
    rejected,
    pending: rows.filter(
      (r) => r.status === RequestStatus.NEW || r.status === RequestStatus.IN_REVIEW,
    ).length,
    approvalRate: decided === 0 ? 0 : Math.round((approved / decided) * 100),
  }
}

export function buildReportData(rows: ApplicationResponse[], truncated = false): ReportData {
  const formTypeCounts = new Map<FormType, number>()
  const departmentCounts = new Map<Department, number>()

  for (const row of rows) {
    formTypeCounts.set(row.formType, (formTypeCounts.get(row.formType) ?? 0) + 1)
    const department = row.applicant.department
    departmentCounts.set(department, (departmentCounts.get(department) ?? 0) + 1)
  }

  return {
    rows,
    summary: summarize(rows),
    byStatus: Object.values(RequestStatus)
      .map((status) => ({ status, count: rows.filter((r) => r.status === status).length }))
      .filter((entry) => entry.count > 0),
    byFormType: Array.from(formTypeCounts, ([formType, count]) => ({ formType, count })).sort(
      (a, b) => b.count - a.count,
    ),
    byDepartment: DEPARTMENT_ORDER.map((department) => ({
      department,
      count: departmentCounts.get(department) ?? 0,
    })).filter((entry) => entry.count > 0),
    truncated,
  }
}

/** Walks `meta.hasNext` instead of asking for one oversized page. */
export async function collectRequests(
  params: Omit<RequestListParams, 'page' | 'pageSize'>,
): Promise<{ rows: ApplicationResponse[]; truncated: boolean }> {
  const rows: ApplicationResponse[] = []
  let page = 1

  for (;;) {
    const response = await requestService.list({
      ...params,
      page,
      pageSize: COLLECT_PAGE_SIZE,
    })
    rows.push(...(response.data ?? []))
    if (!response.meta?.hasNext) return { rows, truncated: false }
    if (page >= MAX_COLLECT_PAGES) return { rows, truncated: true }
    page += 1
  }
}

export interface ExportLabels {
  status: (status: RequestStatus) => string
  formType: (formType: FormType) => string
  department: (department: Department) => string
  sheets: { requests: string; summary: string; departments: string }
  columns: Record<
    'id' | 'title' | 'formType' | 'status' | 'applicant' | 'department' | 'createdDate' | 'updatedDate',
    string
  >
  metrics: Record<'metric' | 'value' | 'total' | 'approved' | 'rejected' | 'pending' | 'approvalRate', string>
  counts: { name: string; count: string }
}

export const reportService = {
  collect: async (params: Omit<RequestListParams, 'page' | 'pageSize'>): Promise<ReportData> => {
    const { rows, truncated } = await collectRequests(params)
    return buildReportData(rows, truncated)
  },

  /** Three sheets: detail rows, status/type summary, department breakdown. */
  exportToExcel: async (data: ReportData, labels: ExportLabels): Promise<void> => {
    if (data.rows.length === 0) return

    const XLSX = await import('xlsx')
    const c = labels.columns

    const detail = data.rows.map((row) => ({
      [c.id]: row.id,
      [c.title]: row.title,
      [c.formType]: labels.formType(row.formType),
      [c.status]: labels.status(row.status),
      [c.applicant]: `${row.applicant.name} ${row.applicant.surname}`,
      [c.department]: labels.department(row.applicant.department),
      [c.createdDate]: row.createdDate,
      [c.updatedDate]: row.updatedDate,
    }))

    const m = labels.metrics
    const summarySheet = [
      { [m.metric]: m.total, [m.value]: data.summary.total },
      { [m.metric]: m.approved, [m.value]: data.summary.approved },
      { [m.metric]: m.rejected, [m.value]: data.summary.rejected },
      { [m.metric]: m.pending, [m.value]: data.summary.pending },
      { [m.metric]: m.approvalRate, [m.value]: `${data.summary.approvalRate}%` },
      {},
      ...data.byStatus.map((entry) => ({
        [m.metric]: labels.status(entry.status),
        [m.value]: entry.count,
      })),
      {},
      ...data.byFormType.map((entry) => ({
        [m.metric]: labels.formType(entry.formType),
        [m.value]: entry.count,
      })),
    ]

    const departmentSheet = data.byDepartment.map((entry) => ({
      [labels.counts.name]: labels.department(entry.department),
      [labels.counts.count]: entry.count,
    }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detail), labels.sheets.requests)
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summarySheet), labels.sheets.summary)
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(departmentSheet),
      labels.sheets.departments,
    )
    XLSX.writeFile(wb, `bitalep-report-${new Date().toISOString().slice(0, 10)}.xlsx`)
  },
}
