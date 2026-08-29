import type { ApiSuccessResponse } from '@/types/api.types'
import type { AttachmentResponse } from '@/types/file.types'

export interface IFileRepository {
  upload(file: File, applicationId: string): Promise<ApiSuccessResponse<AttachmentResponse>>
  delete(id: string): Promise<void>
  getById(id: string): Promise<ApiSuccessResponse<AttachmentResponse>>
  listByRequest(applicationId: string): Promise<ApiSuccessResponse<AttachmentResponse[]>>
}
