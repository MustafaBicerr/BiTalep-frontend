import { api } from '@/services/api'
import type { IAuthRepository } from '@/repositories/interfaces/IAuthRepository'
import type { IRequestRepository } from '@/repositories/interfaces/IRequestRepository'
import type { IFileRepository } from '@/repositories/interfaces/IFileRepository'
import type { IUserRepository } from '@/repositories/interfaces/IUserRepository'
import type { IDashboardRepository } from '@/repositories/interfaces/IDashboardRepository'
import type { INotificationRepository } from '@/repositories/interfaces/INotificationRepository'
import type { LoginRequest, RegisterRequest } from '@/types/auth.types'
import type {
  CreateApplicationRequest,
  RequestListParams,
  UpdateApplicationRequest,
} from '@/types/request.types'
import type { UpdateProfileRequest, UserListParams } from '@/types/user.types'
import type { UserRole } from '@/types/enums'
import type { NotificationListParams } from '@/types/notification.types'

export class HttpAuthRepository implements IAuthRepository {
  async login(payload: LoginRequest) {
    const { data } = await api.post('/api/auth/login', payload)
    return data
  }
  async register(payload: RegisterRequest) {
    const { data } = await api.post('/api/auth/register', payload)
    return data
  }
  async logout() {
    /* client-side */
  }
  async getCurrentUser() {
    const { data } = await api.get('/api/users/me')
    return data
  }
}

export class HttpRequestRepository implements IRequestRepository {
  async list(params?: RequestListParams) {
    const { data } = await api.get('/api/forms', { params })
    return data
  }
  async getById(id: number) {
    const { data } = await api.get(`/api/forms/${id}`)
    return data
  }
  async create(payload: CreateApplicationRequest) {
    const { data } = await api.post('/api/forms', payload)
    return data
  }
  async update(id: number, payload: UpdateApplicationRequest) {
    const { data } = await api.put(`/api/forms/${id}`, payload)
    return data
  }
  async delete(id: number) {
    await api.delete(`/api/forms/${id}`)
  }
  async approve(id: number) {
    const { data } = await api.put(`/api/forms/${id}/approve`)
    return data
  }
  async reject(id: number, reason?: string) {
    const { data } = await api.put(`/api/forms/${id}/reject`, { reason })
    return data
  }
}

export class HttpFileRepository implements IFileRepository {
  async upload(file: File, applicationId: number) {
    const form = new FormData()
    form.append('file', file)
    form.append('applicationId', String(applicationId))
    const { data } = await api.post('/api/files/upload', form)
    return data
  }
  async delete(id: number) {
    await api.delete(`/api/files/${id}`)
  }
  async getById(id: number) {
    const { data } = await api.get(`/api/files/${id}`)
    return data
  }
  async listByRequest(applicationId: number) {
    const { data } = await api.get(`/api/forms/${applicationId}/files`)
    return data
  }
  async listAll() {
    const { data } = await api.get('/api/files')
    return data
  }
}

export class HttpUserRepository implements IUserRepository {
  async list(params?: UserListParams) {
    const { data } = await api.get('/api/users', { params })
    return data
  }
  async getById(id: number) {
    const { data } = await api.get(`/api/users/${id}`)
    return data
  }
  async updateProfile(payload: UpdateProfileRequest) {
    const { data } = await api.put('/api/users/me', payload)
    return data
  }
  async updateRole(id: number, role: UserRole) {
    const { data } = await api.put(`/api/users/${id}/role`, { role })
    return data
  }
}

export class HttpDashboardRepository implements IDashboardRepository {
  async getStats() {
    const { data } = await api.get('/api/dashboard')
    return data
  }
  async getRecentRequests() {
    const { data } = await api.get('/api/dashboard')
    return { data: data.data.recentRequests }
  }
  async getStatusDistribution() {
    const { data } = await api.get('/api/dashboard')
    return { data: data.data.statusDistribution }
  }
}

export class HttpNotificationRepository implements INotificationRepository {
  async list(params?: NotificationListParams) {
    const { data } = await api.get('/api/notifications', { params })
    return data
  }
  async markRead(id: number) {
    await api.put(`/api/notifications/${id}/read`)
  }
  async markAllRead() {
    await api.put('/api/notifications/read-all')
  }
  async getUnreadCount() {
    const { data } = await api.get('/api/notifications/unread-count')
    return data
  }
}
