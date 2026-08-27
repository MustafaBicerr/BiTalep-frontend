import { api } from '@/services/api'
import type { IDashboardRepository } from '@/repositories/interfaces/IDashboardRepository'
import type { ApiSuccessResponse } from '@/types/api.types'
import type { DashboardStatsResponse } from '@/types/request.types'

export class HttpDashboardRepository implements IDashboardRepository {
  async getStats() {
    const { data } =
      await api.get<ApiSuccessResponse<DashboardStatsResponse>>('/api/dashboard')
    return data
  }

  async getRecentRequests(limit = 10) {
    const { data } = await api.get<ApiSuccessResponse<DashboardStatsResponse>>(
      '/api/dashboard',
    )
    return { data: data.data.recentRequests.slice(0, limit) }
  }

  async getStatusDistribution() {
    const { data } = await api.get<ApiSuccessResponse<DashboardStatsResponse>>(
      '/api/dashboard',
    )
    return { data: data.data.statusDistribution }
  }
}
