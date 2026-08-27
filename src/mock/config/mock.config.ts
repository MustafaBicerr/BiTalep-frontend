export type ApiMode = 'mock' | 'real' | 'hybrid'

export type DelayProfile = 'fast' | 'normal' | 'slow'

export interface MockDomainToggles {
  auth: boolean
  requests: boolean
  files: boolean
  users: boolean
  dashboard: boolean
  notifications: boolean
}

export interface MockConfig {
  mode: ApiMode
  persist: boolean
  delayMsOverride: number | null
  domains: MockDomainToggles
}

function parseMode(value: string | undefined): ApiMode {
  if (value === 'real' || value === 'hybrid' || value === 'mock') return value
  return 'mock'
}

function parseDelayOverride(value: string | undefined): number | null {
  if (!value || value.trim() === '') return null
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : null
}

export const mockConfig: MockConfig = {
  mode: parseMode(import.meta.env.VITE_API_MODE),
  persist: import.meta.env.VITE_MOCK_PERSIST !== 'false',
  delayMsOverride: parseDelayOverride(import.meta.env.VITE_MOCK_DELAY_MS),
  domains: {
    auth: true,
    requests: true,
    files: true,
    users: true,
    dashboard: true,
    notifications: true,
  },
}

export function isMockDomain(domain: keyof MockDomainToggles): boolean {
  if (mockConfig.mode === 'mock') return true
  if (mockConfig.mode === 'real') return false
  return mockConfig.domains[domain]
}
