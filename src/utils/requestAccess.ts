import { RequestStatus } from '@/types/enums'

export function isPersonnelMutable(status: RequestStatus): boolean {
  return status === RequestStatus.NEW || status === RequestStatus.NEEDS_UPDATE
}

export function personnelLockKey(status: RequestStatus): 'lockInReview' | 'lockApproved' | 'lockRejected' | 'lockCancelled' | 'cannotEdit' {
  switch (status) {
    case RequestStatus.IN_REVIEW:
      return 'lockInReview'
    case RequestStatus.APPROVED:
      return 'lockApproved'
    case RequestStatus.REJECTED:
      return 'lockRejected'
    case RequestStatus.CANCELLED:
      return 'lockCancelled'
    default:
      return 'cannotEdit'
  }
}
