import { Department } from '@/types/enums'

/** Chart palette for department breakdowns; badges stay neutral on purpose. */
export const DEPARTMENT_COLORS: Record<Department, string> = {
  [Department.HR]: 'var(--color-status-review)',
  [Department.IT]: 'var(--color-info)',
  [Department.FINANCE]: 'var(--color-status-approved)',
  [Department.SALES]: 'var(--color-warning)',
  [Department.OPERATIONS]: 'var(--color-secondary)',
  [Department.MARKETING]: 'var(--color-primary)',
  [Department.OTHER]: 'var(--color-muted-foreground)',
}
