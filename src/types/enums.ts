export enum UserRole {
  PERSONEL = 'PERSONEL',
  ADMIN = 'ADMIN',
}

export enum RequestStatus {
  NEW = 'NEW',
  IN_REVIEW = 'IN_REVIEW',
  NEEDS_UPDATE = 'NEEDS_UPDATE',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum FormType {
  LEAVE = 'LEAVE',
  TRAINING = 'TRAINING',
  ADVANCE = 'ADVANCE',
  MATERIAL = 'MATERIAL',
  TASK = 'TASK',
}

export enum Department {
  HR = 'HR',
  IT = 'IT',
  FINANCE = 'FINANCE',
  SALES = 'SALES',
  OPERATIONS = 'OPERATIONS',
  MARKETING = 'MARKETING',
  OTHER = 'OTHER',
}

/** Display order for department selects and report breakdowns. */
export const DEPARTMENT_ORDER: Department[] = [
  Department.HR,
  Department.IT,
  Department.FINANCE,
  Department.SALES,
  Department.OPERATIONS,
  Department.MARKETING,
  Department.OTHER,
]

export enum NotificationType {
  STATUS_CHANGE = 'STATUS_CHANGE',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEW_REQUEST = 'NEW_REQUEST',
  FILE_UPLOADED = 'FILE_UPLOADED',
  SYSTEM = 'SYSTEM',
}

export const FORM_TYPE_NAMES: Record<FormType, string> = {
  [FormType.LEAVE]: 'İzin',
  [FormType.TRAINING]: 'Eğitim',
  [FormType.ADVANCE]: 'Avans',
  [FormType.MATERIAL]: 'Malzeme',
  [FormType.TASK]: 'Görev',
}

/** Valid status transitions */
export const STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  [RequestStatus.NEW]: [RequestStatus.IN_REVIEW, RequestStatus.NEEDS_UPDATE, RequestStatus.CANCELLED],
  [RequestStatus.IN_REVIEW]: [
    RequestStatus.APPROVED,
    RequestStatus.REJECTED,
    RequestStatus.NEEDS_UPDATE,
    RequestStatus.CANCELLED,
  ],
  [RequestStatus.NEEDS_UPDATE]: [RequestStatus.IN_REVIEW, RequestStatus.CANCELLED],
  [RequestStatus.APPROVED]: [],
  [RequestStatus.REJECTED]: [],
  [RequestStatus.CANCELLED]: [],
}
