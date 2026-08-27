import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

interface SpinnerProps {
  size?: 16 | 20 | 24
  className?: string
}

export function Spinner({ size = 20, className }: SpinnerProps) {
  const { t } = useTranslation('common')
  return (
    <Loader2
      role="status"
      aria-label={t('loading.pleaseWait')}
      className={cn('animate-spin text-current', className)}
      style={{ width: size, height: size }}
    />
  )
}
