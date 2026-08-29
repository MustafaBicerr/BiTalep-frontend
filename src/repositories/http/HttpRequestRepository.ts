import { api } from '@/services/api'
import type { IRequestRepository } from '@/repositories/interfaces/IRequestRepository'
import type { ApiSuccessResponse, PaginatedResponse } from '@/types/api.types'
import type {
  ApplicationResponse,
  CreateApplicationRequest,
  RequestListParams,
  UpdateApplicationRequest,
} from '@/types/request.types'

export class HttpRequestRepository implements IRequestRepository {
  async list(params?: RequestListParams) {
    const { data } = await api.get<PaginatedResponse<ApplicationResponse>>('/api/forms', {
      params,
    })
    return data
  }

  async getById(id: string) {
    const { data } = await api.get<ApiSuccessResponse<ApplicationResponse>>(
      `/api/forms/${id}`,
    )
    return data
  }

  async create(payload: CreateApplicationRequest) {
    const { data } = await api.post<ApiSuccessResponse<ApplicationResponse>>(
      '/api/forms',
      payload,
    )
    return data
  }

  async update(id: string, payload: UpdateApplicationRequest) {
    const { data } = await api.put<ApiSuccessResponse<ApplicationResponse>>(
      `/api/forms/${id}`,
      payload,
    )
    return data
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/api/forms/${id}`)
  }

  async startReview(id: string) {
    const { data } = await api.put<ApiSuccessResponse<ApplicationResponse>>(
      `/api/forms/${id}/review`,
    )
    return data
  }

  async approve(id: string) {
    const { data } = await api.put<ApiSuccessResponse<ApplicationResponse>>(
      `/api/forms/${id}/approve`,
    )
    return data
  }

  async reject(id: string, reason?: string) {
    const { data } = await api.put<ApiSuccessResponse<ApplicationResponse>>(
      `/api/forms/${id}/reject`,
      { reason },
    )
    return data
  }
}
