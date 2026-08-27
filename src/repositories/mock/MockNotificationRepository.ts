import { MockDelay } from '@/mock/engine/MockDelay'
import { MockErrorInjector } from '@/mock/engine/MockErrorInjector'
import { mockStore } from '@/mock/store/MockStore'
import type { INotificationRepository } from '@/repositories/interfaces/INotificationRepository'
import type { NotificationListParams } from '@/types/notification.types'

export class MockNotificationRepository implements INotificationRepository {
  async list(params?: NotificationListParams) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return mockStore.listNotifications(params)
  }

  async markRead(id: number): Promise<void> {
    await MockDelay.wait('fast')
    MockErrorInjector.maybeThrow()
    mockStore.markNotificationRead(id)
  }

  async markAllRead(): Promise<void> {
    await MockDelay.wait('fast')
    MockErrorInjector.maybeThrow()
    mockStore.markAllNotificationsRead()
  }

  async getUnreadCount() {
    await MockDelay.wait('fast')
    MockErrorInjector.maybeThrow()
    return { data: { count: mockStore.getUnreadCount() } }
  }
}
