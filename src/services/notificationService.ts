import { repositories } from '@/repositories'
import type { NotificationListParams } from '@/types/notification.types'

export const notificationService = {
  getNotifications: (params?: NotificationListParams) =>
    repositories.notifications.list(params),
  markRead: (id: number) => repositories.notifications.markRead(id),
  markAllRead: () => repositories.notifications.markAllRead(),
  getUnreadCount: async () => {
    const res = await repositories.notifications.getUnreadCount()
    return res.data.count
  },
}
