import { MockDelay } from '@/mock/engine/MockDelay'
import { MockErrorInjector } from '@/mock/engine/MockErrorInjector'
import { mockStore } from '@/mock/store/MockStore'
import type { ICompanyRepository } from '@/repositories/interfaces/ICompanyRepository'

export class MockCompanyRepository implements ICompanyRepository {
  async getCurrent() {
    await MockDelay.wait('normal')
    MockErrorInjector.maybeThrow()
    return { data: mockStore.getCompany() }
  }
}
