import { mockConfig, type DelayProfile } from '@/mock/config/mock.config'

const PROFILE_MS: Record<DelayProfile, number> = {
  fast: 100,
  normal: 300,
  slow: 800,
}

const JITTER = 50

function resolveDelay(profile: DelayProfile): number {
  if (mockConfig.delayMsOverride != null) {
    return mockConfig.delayMsOverride
  }
  const base = PROFILE_MS[profile]
  const jitter = Math.floor(Math.random() * (JITTER * 2 + 1)) - JITTER
  return Math.max(0, base + jitter)
}

export const MockDelay = {
  async wait(profile: DelayProfile = 'normal'): Promise<void> {
    const ms = resolveDelay(profile)
    if (ms <= 0) return
    await new Promise<void>((resolve) => {
      setTimeout(resolve, ms)
    })
  },
}
