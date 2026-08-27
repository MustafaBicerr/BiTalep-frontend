import { MockDelay } from '@/mock/engine/MockDelay'
import { MockErrorInjector } from '@/mock/engine/MockErrorInjector'
import { mockStore } from '@/mock/store/MockStore'
import type { IRequestRepository } from '@/repositories/interfaces/IRequestRepository'
import { RequestStatus } from '@/types/enums'
import type {
  CreateApplicationRequest,
  RequestListParams,
  UpdateApplicationRequest,
} from '@/types/request.types'

export class MockRequestRepository implements IRequestRepository {
  async list(params?: RequestListParams) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return mockStore.listRequests(params)
  }

  async getById(id: number) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return { data: mockStore.getRequestById(id) }
  }

  async create(data: CreateApplicationRequest) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return { data: mockStore.createRequest(data) }
  }

  async update(id: number, data: UpdateApplicationRequest) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return { data: mockStore.updateRequest(id, data) }
  }

  async delete(id: number): Promise<void> {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    mockStore.deleteRequest(id)
  }

  async approve(id: number) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    const actor = mockStore.requireCurrentUser()
    return {
      data: mockStore.updateRequestStatus(id, RequestStatus.APPROVED, actor.id),
    }
  }

  async reject(id: number, reason?: string) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    const actor = mockStore.requireCurrentUser()
    return {
      data: mockStore.updateRequestStatus(
        id,
        RequestStatus.REJECTED,
        actor.id,
        reason,
      ),
    }
  }
}
