import type { ApiSuccessResponse, PaginatedResponse } from '@/types/api.types'
import type {
  ApplicationResponse,
  CreateApplicationRequest,
  RequestListParams,
  UpdateApplicationRequest,
} from '@/types/request.types'

export interface IRequestRepository {
  list(params?: RequestListParams): Promise<PaginatedResponse<ApplicationResponse>>
  getById(id: string): Promise<ApiSuccessResponse<ApplicationResponse>>
  create(data: CreateApplicationRequest): Promise<ApiSuccessResponse<ApplicationResponse>>
  update(
    id: string,
    data: UpdateApplicationRequest,
  ): Promise<ApiSuccessResponse<ApplicationResponse>>
  delete(id: string): Promise<void>
  /** NEW → IN_REVIEW: admin takes the request into review. */
  startReview(id: string): Promise<ApiSuccessResponse<ApplicationResponse>>
  approve(id: string): Promise<ApiSuccessResponse<ApplicationResponse>>
  reject(id: string, reason?: string): Promise<ApiSuccessResponse<ApplicationResponse>>
}
