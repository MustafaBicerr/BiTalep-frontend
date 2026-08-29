import {
  buildPersonnelInviteHtml,
  type PersonnelInvitePayload,
  type SentInvite,
} from '@/emails/personnelInvite'

/** In-memory outbox for the mock domain. Real sending is a backend concern. */
class MockMailer {
  private invites: SentInvite[] = []

  sendPersonnelInvite(payload: PersonnelInvitePayload): SentInvite {
    const sent: SentInvite = {
      ...payload,
      html: buildPersonnelInviteHtml(payload),
      sentAt: new Date().toISOString(),
    }
    this.invites.push(sent)
    return sent
  }

  getLastInvite(): SentInvite | undefined {
    return this.invites[this.invites.length - 1]
  }

  clear(): void {
    this.invites = []
  }
}

export const mockMailer = new MockMailer()
