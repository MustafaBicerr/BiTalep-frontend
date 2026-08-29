import { MockDelay } from '@/mock/engine/MockDelay'
import { MockErrorInjector } from '@/mock/engine/MockErrorInjector'
import { mockStore } from '@/mock/store/MockStore'
import type { IFileRepository } from '@/repositories/interfaces/IFileRepository'

export class MockFileRepository implements IFileRepository {
  async upload(file: File, applicationId: string) {
    await MockDelay.wait('slow')
    MockErrorInjector.maybeThrow()
    return { data: mockStore.uploadAttachment(file, applicationId) }
  }

  async delete(id: string): Promise<void> {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    mockStore.deleteAttachment(id)
  }

  async getById(id: string) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return { data: mockStore.getAttachmentById(id) }
  }

  async listByRequest(applicationId: string) {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return { data: mockStore.listAttachmentsByRequest(applicationId) }
  }

  async listAll() {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return { data: mockStore.listAllAttachments() }
  }
}
