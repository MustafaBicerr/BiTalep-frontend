import type { Department, FormType, RequestStatus } from './enums'
import type { AttachmentResponse } from './file.types'
import type { UserResponse } from './user.types'

export interface TimelineEntry {
  status: RequestStatus
  date: string
  actor?: UserResponse
  description?: string
}

export interface ApplicationResponse {
  id: string
  title: string
  description: string
  formType: FormType
  formTypeName: string
  status: RequestStatus
  applicant: UserResponse
  applicantId: string
  tenantId: string
  createdDate: string
  updatedDate: string
  attachments?: AttachmentResponse[]
  timeline?: TimelineEntry[]
  rejectReason?: string | null
  updateReason?: string | null
}

export interface CreateApplicationRequest {
  title: string
  description: string
  formType: FormType
}

export interface UpdateApplicationRequest {
  title: string
  description: string
  formType: FormType
}

export interface RequestListParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  status?: RequestStatus[]
  formType?: FormType[]
  dateFrom?: string
  dateTo?: string
  keyword?: string
  applicantId?: string
  /** Filters by the applicant's department. */
  department?: Department[]
  /** Only requests that do (or do not) have at least one attachment. */
  hasAttachments?: boolean
  /** Only requests untouched since this ISO timestamp — powers "overdue" filters. */
  updatedBefore?: string
}

export interface RequestEntity {
  id: string
  title: string
  description: string
  formType: FormType
  status: RequestStatus
  applicantId: string
  tenantId: string
  createdDate: string
  updatedDate: string
  timeline: TimelineEntry[]
  updateReason?: string | null
  rejectReason?: string | null
}

export interface FormTypeEntity {
  id: string
  code: FormType
  name: string
}

export interface StatusDistribution {
  status: RequestStatus
  count: number
}

export interface DashboardResponse {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  todayRequests: number
  recentRequests: ApplicationResponse[]
  statusDistribution: StatusDistribution[]
  weeklyTrend: WeeklyTrendPoint[]
  overduePendingCount: number
}

export interface WeeklyTrendPoint {
  date: string
  count: number
}

export type DashboardStatsResponse = DashboardResponse
