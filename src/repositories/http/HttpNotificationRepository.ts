import { api } from '@/services/api'
import type { INotificationRepository } from '@/repositories/interfaces/INotificationRepository'
import type { ApiSuccessResponse, PaginatedResponse } from '@/types/api.types'
import type {
  NotificationListParams,
  NotificationResponse,
} from '@/types/notification.types'

export class HttpNotificationRepository implements INotificationRepository {
  async list(params?: NotificationListParams) {
    const { data } = await api.get<PaginatedResponse<NotificationResponse>>(
      '/api/notifications',
      { params },
    )
    return data
  }

  async markRead(id: number): Promise<void> {
    await api.put(`/api/notifications/${id}/read`)
  }

  async markAllRead(): Promise<void> {
    await api.put('/api/notifications/read-all')
  }

  async getUnreadCount() {
    const { data } = await api.get<ApiSuccessResponse<{ count: number }>>(
      '/api/notifications/unread-count',
    )
    return data
  }
}
