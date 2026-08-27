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

  async getById(id: number) {
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

  async update(id: number, payload: UpdateApplicationRequest) {
    const { data } = await api.put<ApiSuccessResponse<ApplicationResponse>>(
      `/api/forms/${id}`,
      payload,
    )
    return data
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/api/forms/${id}`)
  }

  async approve(id: number) {
    const { data } = await api.put<ApiSuccessResponse<ApplicationResponse>>(
      `/api/forms/${id}/approve`,
    )
    return data
  }

  async reject(id: number, reason?: string) {
    const { data } = await api.put<ApiSuccessResponse<ApplicationResponse>>(
      `/api/forms/${id}/reject`,
      { reason },
    )
    return data
  }
}
