/** Stable, valid UUID v4-shaped ids for deterministic seeds. */
export function seedUuid(kind: 'tenant' | 'user' | 'request' | 'attachment' | 'notification' | 'formType', n: number): string {
  const prefix: Record<typeof kind, string> = {
    tenant: 'd',
    user: 'a',
    request: 'b',
    attachment: 'c',
    notification: 'e',
    formType: 'f',
  }
  const body = n.toString(16).padStart(11, '0')
  return `00000000-0000-4000-8000-${prefix[kind]}${body}`
}

export const DEMO_TENANT_ID = seedUuid('tenant', 1)

export const userId = (n: number) => seedUuid('user', n)
export const requestId = (n: number) => seedUuid('request', n)
export const attachmentId = (n: number) => seedUuid('attachment', n)
export const notificationId = (n: number) => seedUuid('notification', n)
export const formTypeId = (n: number) => seedUuid('formType', n)

export function newUuid(): string {
  return crypto.randomUUID()
}
