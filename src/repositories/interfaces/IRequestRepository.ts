import type { ApiSuccessResponse, PaginatedResponse } from '@/types/api.types'
import type {
  ApplicationResponse,
  CreateApplicationRequest,
  RequestListParams,
  UpdateApplicationRequest,
} from '@/types/request.types'

export interface IRequestRepository {
  list(params?: RequestListParams): Promise<PaginatedResponse<ApplicationResponse>>
  getById(id: number): Promise<ApiSuccessResponse<ApplicationResponse>>
  create(data: CreateApplicationRequest): Promise<ApiSuccessResponse<ApplicationResponse>>
  update(
    id: number,
    data: UpdateApplicationRequest,
  ): Promise<ApiSuccessResponse<ApplicationResponse>>
  delete(id: number): Promise<void>
  approve(id: number): Promise<ApiSuccessResponse<ApplicationResponse>>
  reject(id: number, reason?: string): Promise<ApiSuccessResponse<ApplicationResponse>>
}
