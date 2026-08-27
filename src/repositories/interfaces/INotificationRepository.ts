import type { ApiSuccessResponse, PaginatedResponse } from '@/types/api.types'
import type {
  NotificationListParams,
  NotificationResponse,
} from '@/types/notification.types'

export interface INotificationRepository {
  list(params?: NotificationListParams): Promise<PaginatedResponse<NotificationResponse>>
  markRead(id: number): Promise<void>
  markAllRead(): Promise<void>
  getUnreadCount(): Promise<ApiSuccessResponse<{ count: number }>>
}
