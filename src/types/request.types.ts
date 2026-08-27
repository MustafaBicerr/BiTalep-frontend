import type { FormType, RequestStatus } from './enums'
import type { AttachmentResponse } from './file.types'
import type { UserResponse } from './user.types'

export interface TimelineEntry {
  status: RequestStatus
  date: string
  actor?: UserResponse
  description?: string
}

export interface ApplicationResponse {
  id: number
  title: string
  description: string
  formType: FormType
  formTypeName: string
  status: RequestStatus
  applicant: UserResponse
  applicantId: number
  createdDate: string
  updatedDate: string
  attachments?: AttachmentResponse[]
  timeline?: TimelineEntry[]
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
}

export interface RequestEntity {
  id: number
  title: string
  description: string
  formType: FormType
  status: RequestStatus
  applicantId: number
  createdDate: string
  updatedDate: string
  timeline: TimelineEntry[]
}

export interface FormTypeEntity {
  id: number
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
}

export type DashboardStatsResponse = DashboardResponse
