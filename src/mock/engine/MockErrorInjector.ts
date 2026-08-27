import { ApiError } from '@/types/api.types'

export type MockErrorFlag =
  | 'FORCE_401'
  | 'FORCE_403'
  | 'FORCE_404'
  | 'FORCE_409'
  | 'FORCE_500'
  | 'FORCE_VALIDATION'
  | 'FORCE_NETWORK'

const FLAG_MAP: Record<
  Exclude<MockErrorFlag, 'FORCE_NETWORK'>,
  { status: number; code: string; message: string }
> = {
  FORCE_401: { status: 401, code: 'UNAUTHORIZED', message: 'errors:unauthorized' },
  FORCE_403: { status: 403, code: 'FORBIDDEN', message: 'errors:forbidden' },
  FORCE_404: { status: 404, code: 'NOT_FOUND', message: 'errors:notFound' },
  FORCE_409: { status: 409, code: 'CONFLICT', message: 'errors:conflict' },
  FORCE_500: { status: 500, code: 'INTERNAL_ERROR', message: 'errors:internal' },
  FORCE_VALIDATION: {
    status: 400,
    code: 'VALIDATION_ERROR',
    message: 'errors:validation',
  },
}

const VALID_FLAGS = new Set<string>([
  'FORCE_401',
  'FORCE_403',
  'FORCE_404',
  'FORCE_409',
  'FORCE_500',
  'FORCE_VALIDATION',
  'FORCE_NETWORK',
])

let forceFlag: MockErrorFlag | null = null

function asFlag(value: string | null | undefined): MockErrorFlag | null {
  if (!value) return null
  return VALID_FLAGS.has(value) ? (value as MockErrorFlag) : null
}

export const MockErrorInjector = {
  setForce(flag: MockErrorFlag | null) {
    forceFlag = flag
    if (typeof window !== 'undefined') {
      window.__MOCK_ERROR__ = flag
    }
  },

  getForce(): MockErrorFlag | null {
    if (typeof window !== 'undefined') {
      return asFlag(window.__MOCK_ERROR__)
    }
    return forceFlag
  },

  maybeThrow(): void {
    const flag = this.getForce()
    if (!flag) return

    if (flag === 'FORCE_NETWORK') {
      throw new ApiError(0, 'NETWORK_ERROR', 'errors:network')
    }

    const mapped = FLAG_MAP[flag]
    throw new ApiError(
      mapped.status,
      mapped.code,
      mapped.message,
      flag === 'FORCE_VALIDATION'
        ? [{ field: 'title', message: 'common:validation.titleRequired' }]
        : undefined,
    )
  },
}
