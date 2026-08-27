import { repositories } from '@/repositories'

export const dashboardService = {
  getStats: async () => {
    const res = await repositories.dashboard.getStats()
    return res.data
  },
  getDashboard: async () => {
    const res = await repositories.dashboard.getStats()
    return res.data
  },
  getRecentRequests: async (limit?: number) => {
    const res = await repositories.dashboard.getRecentRequests(limit)
    return res.data
  },
  getStatusDistribution: async () => {
    const res = await repositories.dashboard.getStatusDistribution()
    return res.data
  },
}
