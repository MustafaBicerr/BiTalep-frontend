/** Temporary password for personnel invites. Never shown in the create form. */
export function generateInvitePassword(): string {
  return `Invite-${crypto.randomUUID().slice(0, 8)}aA!`
}
