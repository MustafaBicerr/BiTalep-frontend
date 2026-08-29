import { api } from '@/services/api'
import type { ICompanyRepository } from '@/repositories/interfaces/ICompanyRepository'
import type { ApiSuccessResponse } from '@/types/api.types'
import type { CompanyResponse } from '@/types/company.types'

export class HttpCompanyRepository implements ICompanyRepository {
  async getCurrent() {
    const { data } = await api.get<ApiSuccessResponse<CompanyResponse>>('/api/company')
    return data
  }
}
