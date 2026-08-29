import { repositories } from '@/repositories'
import type {
  CreateApplicationRequest,
  RequestListParams,
  UpdateApplicationRequest,
} from '@/types/request.types'

export const requestService = {
  list: (params?: RequestListParams) => repositories.requests.list(params),
  getRequests: (params?: RequestListParams) => repositories.requests.list(params),
  getById: async (id: string) => {
    const res = await repositories.requests.getById(id)
    return res.data
  },
  getRequest: async (id: string) => {
    const res = await repositories.requests.getById(id)
    return res.data
  },
  create: async (data: CreateApplicationRequest) => {
    const res = await repositories.requests.create(data)
    return res.data
  },
  createRequest: async (data: CreateApplicationRequest) => {
    const res = await repositories.requests.create(data)
    return res.data
  },
  update: async (id: string, data: UpdateApplicationRequest) => {
    const res = await repositories.requests.update(id, data)
    return res.data
  },
  updateRequest: async (id: string, data: UpdateApplicationRequest) => {
    const res = await repositories.requests.update(id, data)
    return res.data
  },
  delete: (id: string) => repositories.requests.delete(id),
  deleteRequest: (id: string) => repositories.requests.delete(id),
  startReview: async (id: string) => {
    const res = await repositories.requests.startReview(id)
    return res.data
  },
  approve: async (id: string) => {
    const res = await repositories.requests.approve(id)
    return res.data
  },
  approveRequest: async (id: string) => {
    const res = await repositories.requests.approve(id)
    return res.data
  },
  reject: async (id: string, reason?: string) => {
    const res = await repositories.requests.reject(id, reason)
    return res.data
  },
  rejectRequest: async (id: string, reason?: string) => {
    const res = await repositories.requests.reject(id, reason)
    return res.data
  },
  needsUpdate: async (id: string, reason?: string) => {
    const res = await repositories.requests.needsUpdate(id, reason)
    return res.data
  },
}
