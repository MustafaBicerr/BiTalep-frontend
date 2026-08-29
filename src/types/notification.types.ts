import type { NotificationType } from './enums'
import type { UserResponse } from './user.types'

export interface NotificationResponse {
  id: string
  type: NotificationType
  title: string
  description: string
  isRead: boolean
  createdDate: string
  relatedRequestId?: string
  actor?: UserResponse
}

export interface NotificationListParams {
  page?: number
  pageSize?: number
}

export interface NotificationEntity {
  id: string
  type: NotificationType
  title: string
  description: string
  isRead: boolean
  createdDate: string
  relatedRequestId?: string
  actorId?: string
  recipientId: string
  tenantId: string
}
