export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiSuccessResponse<T> {
  data: T
  meta?: PaginationMeta
}

export interface FieldError {
  field: string
  message: string
}

export interface ApiErrorResponse {
  error: {
    code: string
    message: string
    details?: FieldError[]
  }
}

export class ApiError extends Error {
  status: number
  code: string
  fieldErrors?: FieldError[]

  constructor(status: number, code: string, message: string, fieldErrors?: FieldError[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }

  /** Alias matching mock_response_standards `details` */
  get details(): FieldError[] | undefined {
    return this.fieldErrors
  }
}

export type PaginatedResponse<T> = ApiSuccessResponse<T[]>

export function buildPaginationMeta(
  page: number,
  pageSize: number,
  totalItems: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}
