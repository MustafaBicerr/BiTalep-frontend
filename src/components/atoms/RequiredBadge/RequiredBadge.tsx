import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

interface RequiredBadgeProps {
  className?: string
}

export function RequiredBadge({ className }: RequiredBadgeProps) {
  const { t } = useTranslation('forms')
  return (
    <span
      className={cn(
        'ml-1 inline-flex items-center rounded px-2 py-0.5 text-xs font-normal text-muted-foreground bg-muted',
        className,
      )}
    >
      {t('required')}
    </span>
  )
}
