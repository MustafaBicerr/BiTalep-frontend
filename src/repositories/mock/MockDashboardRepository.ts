import { MockDelay } from '@/mock/engine/MockDelay'
import { MockErrorInjector } from '@/mock/engine/MockErrorInjector'
import { mockStore } from '@/mock/store/MockStore'
import type { IDashboardRepository } from '@/repositories/interfaces/IDashboardRepository'

export class MockDashboardRepository implements IDashboardRepository {
  async getStats() {
    await MockDelay.wait('slow')
    MockErrorInjector.maybeThrow()
    return { data: mockStore.getDashboardStats() }
  }

  async getRecentRequests(limit = 10) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    const stats = mockStore.getDashboardStats()
    return { data: stats.recentRequests.slice(0, limit) }
  }

  async getStatusDistribution() {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    const stats = mockStore.getDashboardStats()
    return { data: stats.statusDistribution }
  }
}
