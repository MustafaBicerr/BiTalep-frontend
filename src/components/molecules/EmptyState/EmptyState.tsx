import type { LucideIcon } from 'lucide-react'
import { Bell, FileText, FolderOpen, Search, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

type EmptyPreset = 'noRequests' | 'noFiles' | 'noNotifications' | 'noResults' | 'noUsers'

interface EmptyStateProps {
  preset?: EmptyPreset
  icon?: LucideIcon
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const PRESETS: Record<EmptyPreset, { icon: LucideIcon; hasCta: boolean }> = {
  noRequests: { icon: FileText, hasCta: true },
  noFiles: { icon: FolderOpen, hasCta: true },
  noNotifications: { icon: Bell, hasCta: false },
  noResults: { icon: Search, hasCta: true },
  noUsers: { icon: Users, hasCta: true },
}

export function EmptyState({
  preset,
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const { t } = useTranslation('common')
  const config = preset ? PRESETS[preset] : null
  const Icon = icon ?? config?.icon ?? FileText
  const resolvedTitle = title ?? (preset ? t(`empty.${preset}.title`) : '')
  const resolvedDescription = description ?? (preset ? t(`empty.${preset}.description`) : '')
  const resolvedAction =
    actionLabel ?? (preset && config?.hasCta ? t(`empty.${preset}.action`) : undefined)

  return (
    <div
      className={cn(
        'flex min-h-[200px] flex-col items-center justify-center gap-3 px-4 py-8 text-center',
        className,
      )}
    >
      <Icon className="h-12 w-12 text-muted-foreground" aria-hidden />
      <h3 className="text-xl font-semibold text-foreground">{resolvedTitle}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{resolvedDescription}</p>
      {resolvedAction && onAction ? (
        <Button type="button" onClick={onAction} className="mt-2">
          {resolvedAction}
        </Button>
      ) : null}
    </div>
  )
}
