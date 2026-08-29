import type { ApiSuccessResponse } from '@/types/api.types'
import type { CompanyResponse } from '@/types/company.types'

export interface ICompanyRepository {
  getCurrent(): Promise<ApiSuccessResponse<CompanyResponse>>
}
