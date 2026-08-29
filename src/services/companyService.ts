import { repositories } from '@/repositories'

export const companyService = {
  getCurrent: async () => {
    const res = await repositories.company.getCurrent()
    return res.data
  },
}
