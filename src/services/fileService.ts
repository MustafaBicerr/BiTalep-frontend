import { repositories } from '@/repositories'

export const fileService = {
  list: async () => mockStoreListAll(),
  upload: async (file: File, applicationId: string) => {
    const res = await repositories.files.upload(file, applicationId)
    return res.data
  },
  uploadFile: async (file: File, applicationId: string) => {
    const res = await repositories.files.upload(file, applicationId)
    return res.data
  },
  delete: (id: string) => repositories.files.delete(id),
  deleteFile: (id: string) => repositories.files.delete(id),
  getFile: async (id: string) => {
    const res = await repositories.files.getById(id)
    return res.data
  },
  getFilesByRequest: async (applicationId: string) => {
    const res = await repositories.files.listByRequest(applicationId)
    return res.data
  },
}

async function mockStoreListAll() {
  const { mockStore } = await import('@/mock/store/MockStore')
  const { MockDelay } = await import('@/mock/engine/MockDelay')
  await MockDelay.wait('normal')
  return mockStore.listAllAttachments()
}
