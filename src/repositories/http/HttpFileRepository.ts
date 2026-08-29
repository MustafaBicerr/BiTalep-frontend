import { api } from '@/services/api'
import type { IFileRepository } from '@/repositories/interfaces/IFileRepository'
import type { ApiSuccessResponse } from '@/types/api.types'
import type { AttachmentResponse } from '@/types/file.types'

export class HttpFileRepository implements IFileRepository {
  async upload(file: File, applicationId: string) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('applicationId', String(applicationId))
    const { data } = await api.post<ApiSuccessResponse<AttachmentResponse>>(
      '/api/files/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/api/files/${id}`)
  }

  async getById(id: string) {
    const { data } = await api.get<ApiSuccessResponse<AttachmentResponse>>(
      `/api/files/${id}`,
    )
    return data
  }

  async listByRequest(applicationId: string) {
    const { data } = await api.get<ApiSuccessResponse<AttachmentResponse[]>>(
      `/api/forms/${applicationId}/files`,
    )
    return data
  }

  async listAll() {
    const { data } = await api.get<ApiSuccessResponse<AttachmentResponse[]>>('/api/files', {
      params: { page: 1, pageSize: 100 },
    })
    return data
  }
}
