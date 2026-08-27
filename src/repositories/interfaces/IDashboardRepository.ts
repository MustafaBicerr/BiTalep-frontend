import type { ApiSuccessResponse } from '@/types/api.types'
import type {
  ApplicationResponse,
  DashboardStatsResponse,
  StatusDistribution,
} from '@/types/request.types'

export interface IDashboardRepository {
  getStats(): Promise<ApiSuccessResponse<DashboardStatsResponse>>
  getRecentRequests(limit?: number): Promise<ApiSuccessResponse<ApplicationResponse[]>>
  getStatusDistribution(): Promise<ApiSuccessResponse<StatusDistribution[]>>
}
