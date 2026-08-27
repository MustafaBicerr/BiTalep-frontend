import type { NotificationType } from './enums'
import type { UserResponse } from './user.types'

export interface NotificationResponse {
  id: number
  type: NotificationType
  title: string
  description: string
  isRead: boolean
  createdDate: string
  relatedRequestId?: number
  actor?: UserResponse
}

export interface NotificationListParams {
  page?: number
  pageSize?: number
}

export interface NotificationEntity {
  id: number
  type: NotificationType
  title: string
  description: string
  isRead: boolean
  createdDate: string
  relatedRequestId?: number
  actorId?: number
  recipientId: number
}
