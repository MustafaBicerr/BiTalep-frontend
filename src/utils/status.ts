import { RequestStatus } from '@/types/enums'

/** i18n key inside the `status` namespace for a request status. */
export function statusKey(status: RequestStatus): string {
  switch (status) {
    case RequestStatus.NEW:
      return 'new'
    case RequestStatus.IN_REVIEW:
      return 'inReview'
    case RequestStatus.APPROVED:
      return 'approved'
    case RequestStatus.REJECTED:
      return 'rejected'
    case RequestStatus.CANCELLED:
      return 'cancelled'
  }
}
