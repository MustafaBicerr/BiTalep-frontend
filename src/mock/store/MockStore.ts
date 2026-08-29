import { DEMO_TENANT_ID, newUuid } from '@/lib/ids'
import { mockConfig } from '@/mock/config/mock.config'
import {
  attachmentsSeed,
  createRequestsSeed,
  formTypesSeed,
  notificationsSeed,
  usersSeed,
} from '@/mock/seeds'
import { ApiError, buildPaginationMeta } from '@/types/api.types'
import {
  Department,
  FORM_TYPE_NAMES,
  NotificationType,
  RequestStatus,
  STATUS_TRANSITIONS,
  UserRole,
  type FormType,
} from '@/types/enums'
import type { CompanyEntity } from '@/types/company.types'
import type { AttachmentEntity, AttachmentResponse } from '@/types/file.types'
import type {
  NotificationEntity,
  NotificationListParams,
  NotificationResponse,
} from '@/types/notification.types'
import type {
  ApplicationResponse,
  CreateApplicationRequest,
  DashboardResponse,
  FormTypeEntity,
  RequestEntity,
  RequestListParams,
  StatusDistribution,
  UpdateApplicationRequest,
} from '@/types/request.types'
import type {
  UpdateProfileRequest,
  UserEntity,
  UserListParams,
  UserResponse,
} from '@/types/user.types'

const STORAGE_KEY = 'bitalep-mock-store'
/** Bump when seed shape/count changes so stale localStorage is discarded */
const SEED_VERSION = 4

const DEMO_COMPANY: CompanyEntity = {
  id: DEMO_TENANT_ID,
  name: 'DEMO',
  plan: 'PRO',
  createdDate: '2025-01-01T00:00:00.000Z',
}

export interface SessionEntity {
  token: string
  userId: string
  createdAt: string
}

interface PersistableState {
  seedVersion?: number
  users: UserEntity[]
  formTypes: FormTypeEntity[]
  requests: RequestEntity[]
  attachments: AttachmentEntity[]
  notifications: NotificationEntity[]
  company: CompanyEntity
  currentUserId: string | null
  sessions: Array<[string, SessionEntity]>
}

function cloneUsers(users: UserEntity[]): UserEntity[] {
  return users.map((u) => ({ ...u }))
}

function toUserResponse(user: UserEntity): UserResponse {
  return {
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    role: user.role,
    department: user.department,
    tenantId: user.tenantId,
    createdDate: user.createdDate,
  }
}

function startOfDayIso(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function endOfDayIso(date: Date): string {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

function compareValues(
  av: unknown,
  bv: unknown,
  sortOrder: 'asc' | 'desc',
): number {
  if (av === bv) return 0
  if (av == null) return 1
  if (bv == null) return -1
  const cmp = av < bv ? -1 : 1
  return sortOrder === 'asc' ? cmp : -cmp
}

function readField(obj: object, key: string): unknown {
  return (obj as Record<string, unknown>)[key]
}

class MockStore {
  users: UserEntity[] = []
  formTypes: FormTypeEntity[] = []
  requests: RequestEntity[] = []
  attachments: AttachmentEntity[] = []
  notifications: NotificationEntity[] = []
  company: CompanyEntity = { ...DEMO_COMPANY }
  sessions = new Map<string, SessionEntity>()
  currentUserId: string | null = null

  constructor() {
    this.loadInitial()
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      window.__MOCK_STORE__ = this
    }
  }

  private loadInitial() {
    if (mockConfig.persist && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as PersistableState
          if (parsed.seedVersion === SEED_VERSION) {
            this.hydrate(parsed)
            return
          }
        } catch {
          // fall through to seeds
        }
      }
    }
    this.loadSeeds()
  }

  private loadSeeds() {
    this.users = cloneUsers(usersSeed)
    this.formTypes = formTypesSeed.map((f) => ({ ...f }))
    this.requests = createRequestsSeed().map((r) => ({
      ...r,
      timeline: r.timeline.map((t) => ({ ...t })),
    }))
    this.attachments = attachmentsSeed.map((a) => ({ ...a }))
    this.notifications = notificationsSeed.map((n) => ({ ...n }))
    this.company = { ...DEMO_COMPANY }
    this.sessions = new Map()
    this.currentUserId = null
    this.persist()
  }

  private hydrate(state: PersistableState) {
    this.users = state.users.map((u) => {
      const seed = usersSeed.find((s) => s.id === u.id || s.email === u.email)
      return {
        ...u,
        password: u.password || seed?.password || 'Test1234!',
        department: u.department ?? seed?.department ?? Department.OTHER,
        tenantId: u.tenantId ?? seed?.tenantId ?? DEMO_TENANT_ID,
      }
    })
    this.formTypes = state.formTypes
    this.requests = state.requests
    this.attachments = state.attachments
    this.notifications = state.notifications
    this.company = state.company ?? { ...DEMO_COMPANY }
    this.currentUserId = state.currentUserId
    this.sessions = new Map(state.sessions ?? [])
  }

  persist() {
    if (!mockConfig.persist || typeof localStorage === 'undefined') return
    const payload: PersistableState = {
      seedVersion: SEED_VERSION,
      users: this.users.map((u) => ({
        id: u.id,
        name: u.name,
        surname: u.surname,
        email: u.email,
        role: u.role,
        department: u.department,
        tenantId: u.tenantId,
        createdDate: u.createdDate,
        password: '',
      })),
      formTypes: this.formTypes,
      requests: this.requests,
      attachments: this.attachments,
      notifications: this.notifications,
      company: this.company,
      currentUserId: this.currentUserId,
      sessions: Array.from(this.sessions.entries()),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  reset() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
    this.loadSeeds()
  }

  // ─── Auth / session ─────────────────────────────────────────────

  createSession(userId: string): string {
    const token = `mock-token-${userId}-${Date.now()}`
    this.sessions.set(token, {
      token,
      userId,
      createdAt: new Date().toISOString(),
    })
    this.currentUserId = userId
    this.persist()
    return token
  }

  setSessionFromToken(token: string | null) {
    if (!token) {
      this.currentUserId = null
      return
    }
    const session = this.sessions.get(token)
    this.currentUserId = session?.userId ?? null
  }

  clearSession(token?: string) {
    if (token) this.sessions.delete(token)
    this.currentUserId = null
    this.persist()
  }

  getCurrentUser(): UserEntity | null {
    if (this.currentUserId == null) return null
    return this.users.find((u) => u.id === this.currentUserId) ?? null
  }

  requireCurrentUser(): UserEntity {
    const user = this.getCurrentUser()
    if (!user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'errors:unauthorized')
    }
    return user
  }

  findUserByEmail(email: string): UserEntity | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  }

  // ─── Users ──────────────────────────────────────────────────────

  toUserResponse(user: UserEntity): UserResponse {
    return toUserResponse(user)
  }

  listUsers(params: UserListParams = {}) {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 10
    let items = [...this.users]
    const tenantId = this.getCurrentUser()?.tenantId ?? DEMO_TENANT_ID
    items = items.filter((u) => u.tenantId === tenantId)

    if (params.role) {
      items = items.filter((u) => u.role === params.role)
    }
    if (params.department) {
      items = items.filter((u) => u.department === params.department)
    }
    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      items = items.filter(
        (u) =>
          u.name.toLowerCase().includes(kw) ||
          u.surname.toLowerCase().includes(kw) ||
          u.email.toLowerCase().includes(kw),
      )
    }

    const sortBy = params.sortBy ?? 'id'
    const sortOrder = params.sortOrder ?? 'asc'
    items.sort((a, b) =>
      compareValues(readField(a, sortBy), readField(b, sortBy), sortOrder),
    )

    const totalItems = items.length
    const start = (page - 1) * pageSize
    const slice = items.slice(start, start + pageSize)
    return {
      data: slice.map(toUserResponse),
      meta: buildPaginationMeta(page, pageSize, totalItems),
    }
  }

  getUserById(id: string): UserResponse {
    const user = this.users.find((u) => u.id === id)
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'errors:notFound')
    return toUserResponse(user)
  }

  createUser(input: {
    name: string
    surname: string
    email: string
    password: string
    role?: UserRole
    department?: Department
  }): UserEntity {
    if (this.findUserByEmail(input.email)) {
      throw new ApiError(409, 'CONFLICT', 'errors:conflict', [
        { field: 'email', message: 'errors:emailTaken' },
      ])
    }
    const user: UserEntity = {
      id: newUuid(),
      name: input.name,
      surname: input.surname,
      email: input.email,
      password: input.password,
      role: input.role ?? UserRole.PERSONEL,
      department: input.department ?? Department.OTHER,
      tenantId: this.getCurrentUser()?.tenantId ?? DEMO_TENANT_ID,
      createdDate: new Date().toISOString(),
    }
    this.users.push(user)
    this.persist()
    return user
  }

  updateProfile(data: UpdateProfileRequest): UserResponse {
    const user = this.requireCurrentUser()
    user.name = data.name
    user.surname = data.surname
    this.persist()
    return toUserResponse(user)
  }

  updateUserRole(id: string, role: UserRole): UserResponse {
    const user = this.users.find((u) => u.id === id)
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'errors:notFound')
    user.role = role
    this.persist()
    return toUserResponse(user)
  }

  // ─── Requests ───────────────────────────────────────────────────

  private formTypeName(code: FormType): string {
    const found = this.formTypes.find((f) => f.code === code)
    return found?.name ?? FORM_TYPE_NAMES[code]
  }

  private mapRequest(
    entity: RequestEntity,
    options?: { includeAttachments?: boolean },
  ): ApplicationResponse {
    const applicant = this.users.find((u) => u.id === entity.applicantId)
    if (!applicant) {
      throw new ApiError(500, 'INTERNAL_ERROR', 'errors:internal')
    }

    const response: ApplicationResponse = {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      formType: entity.formType,
      formTypeName: this.formTypeName(entity.formType),
      status: entity.status,
      applicant: toUserResponse(applicant),
      applicantId: entity.applicantId,
      tenantId: entity.tenantId,
      createdDate: entity.createdDate,
      updatedDate: entity.updatedDate,
      timeline: entity.timeline.map((entry) => ({ ...entry })),
    }

    if (options?.includeAttachments !== false) {
      response.attachments = this.attachments
        .filter((a) => a.applicationId === entity.id)
        .map((a) => ({ ...a }))
    }

    return response
  }

  private assertCanAccessRequest(entity: RequestEntity) {
    const user = this.requireCurrentUser()
    if (user.role === UserRole.PERSONEL && entity.applicantId !== user.id) {
      throw new ApiError(403, 'FORBIDDEN', 'errors:forbidden')
    }
  }

  listRequests(params: RequestListParams = {}) {
    const user = this.requireCurrentUser()
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 10

    let items = this.requests.filter((r) => r.tenantId === user.tenantId)
    if (user.role === UserRole.PERSONEL) {
      items = items.filter((r) => r.applicantId === user.id)
    }

    if (params.applicantId != null && user.role === UserRole.ADMIN) {
      items = items.filter((r) => r.applicantId === params.applicantId)
    }

    if (params.department?.length && user.role === UserRole.ADMIN) {
      const allowed = new Set(params.department)
      const departmentByUserId = new Map(this.users.map((u) => [u.id, u.department]))
      items = items.filter((r) => {
        const dept = departmentByUserId.get(r.applicantId)
        return dept != null && allowed.has(dept)
      })
    }

    if (params.status?.length) {
      items = items.filter((r) => params.status!.includes(r.status))
    }
    if (params.formType?.length) {
      items = items.filter((r) => params.formType!.includes(r.formType))
    }
    if (params.dateFrom) {
      const from = startOfDayIso(new Date(params.dateFrom))
      items = items.filter((r) => r.createdDate >= from)
    }
    if (params.dateTo) {
      const to = endOfDayIso(new Date(params.dateTo))
      items = items.filter((r) => r.createdDate <= to)
    }
    if (params.updatedBefore) {
      items = items.filter((r) => (r.updatedDate || r.createdDate) <= params.updatedBefore!)
    }
    if (params.hasAttachments != null) {
      const withAttachment = new Set(this.attachments.map((a) => a.applicationId))
      items = items.filter((r) => withAttachment.has(r.id) === params.hasAttachments)
    }
    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      items = items.filter(
        (r) =>
          r.title.toLowerCase().includes(kw) ||
          r.description.toLowerCase().includes(kw),
      )
    }

    const sortBy = params.sortBy ?? 'createdDate'
    const sortOrder = params.sortOrder ?? 'desc'
    items.sort((a, b) =>
      compareValues(readField(a, sortBy), readField(b, sortBy), sortOrder),
    )

    const totalItems = items.length
    const start = (page - 1) * pageSize
    const slice = items.slice(start, start + pageSize)

    return {
      data: slice.map((r) => this.mapRequest(r)),
      meta: buildPaginationMeta(page, pageSize, totalItems),
    }
  }

  getRequestById(id: string): ApplicationResponse {
    const entity = this.requests.find((r) => r.id === id)
    if (!entity) throw new ApiError(404, 'NOT_FOUND', 'errors:notFound')
    this.assertCanAccessRequest(entity)
    return this.mapRequest(entity)
  }

  createRequest(data: CreateApplicationRequest): ApplicationResponse {
    const user = this.requireCurrentUser()
    const now = new Date().toISOString()
    const entity: RequestEntity = {
      id: newUuid(),
      title: data.title,
      description: data.description,
      formType: data.formType,
      status: RequestStatus.NEW,
      applicantId: user.id,
      tenantId: user.tenantId,
      createdDate: now,
      updatedDate: now,
      timeline: [
        {
          status: RequestStatus.NEW,
          date: now,
          actor: toUserResponse(user),
          description: 'Talep oluşturuldu',
        },
      ],
    }
    this.requests.unshift(entity)

    // Notify admins of new request
    for (const admin of this.users.filter((u) => u.role === UserRole.ADMIN && u.tenantId === user.tenantId)) {
      this.createNotification({
        type: NotificationType.NEW_REQUEST,
        title: 'Yeni talep',
        description: `${data.title} oluşturuldu.`,
        recipientId: admin.id,
        relatedRequestId: entity.id,
        actorId: user.id,
      })
    }

    this.persist()
    return this.mapRequest(entity)
  }

  updateRequest(id: string, data: UpdateApplicationRequest): ApplicationResponse {
    const entity = this.requests.find((r) => r.id === id)
    if (!entity) throw new ApiError(404, 'NOT_FOUND', 'errors:notFound')
    this.assertCanAccessRequest(entity)

    const user = this.requireCurrentUser()
    if (user.role === UserRole.PERSONEL && entity.status !== RequestStatus.NEW) {
      throw new ApiError(409, 'CONFLICT', 'errors:conflict')
    }

    entity.title = data.title
    entity.description = data.description
    entity.formType = data.formType
    entity.updatedDate = new Date().toISOString()
    this.persist()
    return this.mapRequest(entity)
  }

  deleteRequest(id: string): void {
    const idx = this.requests.findIndex((r) => r.id === id)
    if (idx === -1) throw new ApiError(404, 'NOT_FOUND', 'errors:notFound')
    const entity = this.requests[idx]
    this.assertCanAccessRequest(entity)

    const user = this.requireCurrentUser()
    if (user.role === UserRole.PERSONEL && entity.status !== RequestStatus.NEW) {
      throw new ApiError(409, 'CONFLICT', 'errors:conflict')
    }

    this.requests.splice(idx, 1)
    this.attachments = this.attachments.filter((a) => a.applicationId !== id)
    this.persist()
  }

  updateRequestStatus(
    id: string,
    newStatus: RequestStatus,
    actorId: string,
    description?: string,
  ): ApplicationResponse {
    const entity = this.requests.find((r) => r.id === id)
    if (!entity) throw new ApiError(404, 'NOT_FOUND', 'errors:notFound')

    const allowed = STATUS_TRANSITIONS[entity.status]
    if (!allowed.includes(newStatus)) {
      throw new ApiError(409, 'CONFLICT', 'errors:conflict')
    }

    const actor = this.users.find((u) => u.id === actorId)
    const now = new Date().toISOString()
    entity.status = newStatus
    entity.updatedDate = now
    entity.timeline.push({
      status: newStatus,
      date: now,
      actor: actor ? toUserResponse(actor) : undefined,
      description:
        description ??
        (newStatus === RequestStatus.APPROVED
          ? 'Talep onaylandı'
          : newStatus === RequestStatus.REJECTED
            ? 'Talep reddedildi'
            : newStatus === RequestStatus.CANCELLED
              ? 'Talep iptal edildi'
              : newStatus === RequestStatus.IN_REVIEW
                ? 'İncelemeye alındı'
                : 'Durum güncellendi'),
    })

    let notifType = NotificationType.STATUS_CHANGE
    let title = 'Durum güncellendi'
    if (newStatus === RequestStatus.APPROVED) {
      notifType = NotificationType.APPROVED
      title = 'Talep onaylandı'
    } else if (newStatus === RequestStatus.REJECTED) {
      notifType = NotificationType.REJECTED
      title = 'Talep reddedildi'
    }

    this.createNotification({
      type: notifType,
      title,
      description: description ?? `${entity.title} → ${newStatus}`,
      recipientId: entity.applicantId,
      relatedRequestId: entity.id,
      actorId,
    })

    this.persist()
    return this.mapRequest(entity)
  }

  // ─── Attachments ────────────────────────────────────────────────

  toAttachment(entity: AttachmentEntity): AttachmentResponse {
    return { ...entity }
  }

  listAttachmentsByRequest(applicationId: string): AttachmentResponse[] {
    this.getRequestById(applicationId)
    return this.attachments
      .filter((a) => a.applicationId === applicationId)
      .map((a) => ({ ...a }))
  }

  listAllAttachments(): AttachmentResponse[] {
    const user = this.requireCurrentUser()
    let items = [...this.attachments]
    if (user.role === UserRole.PERSONEL) {
      const ownIds = new Set(
        this.requests.filter((r) => r.applicantId === user.id).map((r) => r.id),
      )
      items = items.filter((a) => ownIds.has(a.applicationId))
    }
    return items.map((a) => ({ ...a }))
  }

  getAttachmentById(id: string): AttachmentResponse {
    const entity = this.attachments.find((a) => a.id === id)
    if (!entity) throw new ApiError(404, 'NOT_FOUND', 'errors:notFound')
    this.getRequestById(entity.applicationId)
    return { ...entity }
  }

  uploadAttachment(file: File, applicationId: string): AttachmentResponse {
    this.getRequestById(applicationId)
    const user = this.requireCurrentUser()
    const now = new Date().toISOString()
    const id = newUuid()
    const entity: AttachmentEntity = {
      id,
      fileName: `file-${id.slice(0, 8)}-${file.name}`,
      originalName: file.name,
      filePath: `/mock-files/${file.name}`,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      uploadDate: now,
      applicationId,
      tenantId: user.tenantId,
    }
    this.attachments.push(entity)

    this.createNotification({
      type: NotificationType.FILE_UPLOADED,
      title: 'Dosya yüklendi',
      description: `${file.name} eklendi.`,
      recipientId: user.id,
      relatedRequestId: applicationId,
      actorId: user.id,
    })

    this.persist()
    return { ...entity }
  }

  deleteAttachment(id: string): void {
    const idx = this.attachments.findIndex((a) => a.id === id)
    if (idx === -1) throw new ApiError(404, 'NOT_FOUND', 'errors:notFound')
    const entity = this.attachments[idx]
    this.getRequestById(entity.applicationId)
    this.attachments.splice(idx, 1)
    this.persist()
  }

  // ─── Notifications ──────────────────────────────────────────────

  private createNotification(input: {
    type: NotificationType
    title: string
    description: string
    recipientId: string
    relatedRequestId?: string
    actorId?: string
    isRead?: boolean
  }) {
    const recipient = this.users.find((u) => u.id === input.recipientId)
    const entity: NotificationEntity = {
      id: newUuid(),
      type: input.type,
      title: input.title,
      description: input.description,
      isRead: input.isRead ?? false,
      createdDate: new Date().toISOString(),
      relatedRequestId: input.relatedRequestId,
      actorId: input.actorId,
      recipientId: input.recipientId,
      tenantId: recipient?.tenantId ?? DEMO_TENANT_ID,
    }
    this.notifications.unshift(entity)
  }

  private mapNotification(entity: NotificationEntity): NotificationResponse {
    const actor = entity.actorId
      ? this.users.find((u) => u.id === entity.actorId)
      : undefined
    return {
      id: entity.id,
      type: entity.type,
      title: entity.title,
      description: entity.description,
      isRead: entity.isRead,
      createdDate: entity.createdDate,
      relatedRequestId: entity.relatedRequestId,
      actor: actor ? toUserResponse(actor) : undefined,
    }
  }

  listNotifications(params: NotificationListParams = {}) {
    const user = this.requireCurrentUser()
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 10
    const items = this.notifications
      .filter((n) => n.recipientId === user.id)
      .sort((a, b) => (a.createdDate < b.createdDate ? 1 : -1))

    const totalItems = items.length
    const start = (page - 1) * pageSize
    const slice = items.slice(start, start + pageSize)
    return {
      data: slice.map((n) => this.mapNotification(n)),
      meta: buildPaginationMeta(page, pageSize, totalItems),
    }
  }

  markNotificationRead(id: string): void {
    const user = this.requireCurrentUser()
    const entity = this.notifications.find((n) => n.id === id)
    if (!entity || entity.recipientId !== user.id) {
      throw new ApiError(404, 'NOT_FOUND', 'errors:notFound')
    }
    entity.isRead = true
    this.persist()
  }

  markAllNotificationsRead(): void {
    const user = this.requireCurrentUser()
    for (const n of this.notifications) {
      if (n.recipientId === user.id) n.isRead = true
    }
    this.persist()
  }

  getUnreadCount(): number {
    const user = this.requireCurrentUser()
    return this.notifications.filter((n) => n.recipientId === user.id && !n.isRead)
      .length
  }

  // ─── Dashboard ──────────────────────────────────────────────────

  getDashboardStats(): DashboardResponse {
    const user = this.requireCurrentUser()
    let items = this.requests.filter((r) => r.tenantId === user.tenantId)
    if (user.role === UserRole.PERSONEL) {
      items = items.filter((r) => r.applicantId === user.id)
    }

    const todayStart = startOfDayIso(new Date())
    const todayEnd = endOfDayIso(new Date())

    const statusDistribution: StatusDistribution[] = Object.values(RequestStatus).map(
      (status) => ({
        status,
        count: items.filter((r) => r.status === status).length,
      }),
    )

    const recent = [...items]
      .sort((a, b) => (a.createdDate < b.createdDate ? 1 : -1))
      .slice(0, 10)
      .map((r) => this.mapRequest(r, { includeAttachments: false }))

    const weeklyTrend: { date: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date()
      day.setHours(0, 0, 0, 0)
      day.setDate(day.getDate() - i)
      const dayStart = startOfDayIso(day)
      const dayEnd = endOfDayIso(day)
      const dateKey = dayStart.slice(0, 10)
      weeklyTrend.push({
        date: dateKey,
        count: items.filter((r) => r.createdDate >= dayStart && r.createdDate <= dayEnd).length,
      })
    }

    const overdueMs = 3 * 24 * 60 * 60 * 1000
    const now = Date.now()
    const overduePendingCount = items.filter((r) => {
      if (r.status !== RequestStatus.IN_REVIEW) return false
      const anchor = new Date(r.updatedDate || r.createdDate).getTime()
      return now - anchor > overdueMs
    }).length

    return {
      totalRequests: items.length,
      pendingRequests: items.filter(
        (r) => r.status === RequestStatus.NEW || r.status === RequestStatus.IN_REVIEW,
      ).length,
      approvedRequests: items.filter((r) => r.status === RequestStatus.APPROVED).length,
      rejectedRequests: items.filter((r) => r.status === RequestStatus.REJECTED).length,
      todayRequests: items.filter(
        (r) => r.createdDate >= todayStart && r.createdDate <= todayEnd,
      ).length,
      recentRequests: recent,
      statusDistribution,
      weeklyTrend,
      overduePendingCount,
    }
  }

  getCompany(): CompanyEntity {
    this.requireCurrentUser()
    return { ...this.company }
  }
}

export const mockStore = new MockStore()
export type { MockStore }
