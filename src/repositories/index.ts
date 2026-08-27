import { isMockDomain, mockConfig, type ApiMode } from '@/mock/config/mock.config'
import { HttpAuthRepository } from '@/repositories/http/HttpAuthRepository'
import { HttpDashboardRepository } from '@/repositories/http/HttpDashboardRepository'
import { HttpFileRepository } from '@/repositories/http/HttpFileRepository'
import { HttpNotificationRepository } from '@/repositories/http/HttpNotificationRepository'
import { HttpRequestRepository } from '@/repositories/http/HttpRequestRepository'
import { HttpUserRepository } from '@/repositories/http/HttpUserRepository'
import type { IAuthRepository } from '@/repositories/interfaces/IAuthRepository'
import type { IDashboardRepository } from '@/repositories/interfaces/IDashboardRepository'
import type { IFileRepository } from '@/repositories/interfaces/IFileRepository'
import type { INotificationRepository } from '@/repositories/interfaces/INotificationRepository'
import type { IRequestRepository } from '@/repositories/interfaces/IRequestRepository'
import type { IUserRepository } from '@/repositories/interfaces/IUserRepository'
import { MockAuthRepository } from '@/repositories/mock/MockAuthRepository'
import { MockDashboardRepository } from '@/repositories/mock/MockDashboardRepository'
import { MockFileRepository } from '@/repositories/mock/MockFileRepository'
import { MockNotificationRepository } from '@/repositories/mock/MockNotificationRepository'
import { MockRequestRepository } from '@/repositories/mock/MockRequestRepository'
import { MockUserRepository } from '@/repositories/mock/MockUserRepository'

export interface Repositories {
  auth: IAuthRepository
  requests: IRequestRepository
  files: IFileRepository
  users: IUserRepository
  dashboard: IDashboardRepository
  notifications: INotificationRepository
}

export function createRepositories(mode: ApiMode = mockConfig.mode): Repositories {
  const shouldUseMock = (domain: keyof typeof mockConfig.domains) => {
    if (mode === 'mock') return true
    if (mode === 'real') return false
    return isMockDomain(domain)
  }

  return {
    auth: shouldUseMock('auth') ? new MockAuthRepository() : new HttpAuthRepository(),
    requests: shouldUseMock('requests')
      ? new MockRequestRepository()
      : new HttpRequestRepository(),
    files: shouldUseMock('files') ? new MockFileRepository() : new HttpFileRepository(),
    users: shouldUseMock('users') ? new MockUserRepository() : new HttpUserRepository(),
    dashboard: shouldUseMock('dashboard')
      ? new MockDashboardRepository()
      : new HttpDashboardRepository(),
    notifications: shouldUseMock('notifications')
      ? new MockNotificationRepository()
      : new HttpNotificationRepository(),
  }
}

export const repositories = createRepositories()
