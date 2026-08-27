import type { ApiSuccessResponse } from '@/types/api.types'
import type { AttachmentResponse } from '@/types/file.types'

export interface IFileRepository {
  upload(file: File, applicationId: number): Promise<ApiSuccessResponse<AttachmentResponse>>
  delete(id: number): Promise<void>
  getById(id: number): Promise<ApiSuccessResponse<AttachmentResponse>>
  listByRequest(applicationId: number): Promise<ApiSuccessResponse<AttachmentResponse[]>>
}
