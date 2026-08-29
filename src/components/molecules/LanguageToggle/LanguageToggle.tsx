import { useTranslation } from 'react-i18next'
import { useLanguage } from '@/hooks/useLanguage'
import type { AppLanguage } from '@/lib/i18n'
import { cn } from '@/utils/cn'

const OPTIONS: Array<{ value: AppLanguage; shortKey: string; fullKey: string }> = [
  { value: 'tr', shortKey: 'language.trShort', fullKey: 'language.tr' },
  { value: 'en', shortKey: 'language.enShort', fullKey: 'language.en' },
]

export function LanguageToggle({ className }: { className?: string }) {
  const { t } = useTranslation('common')
  const { language, setLanguage } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full border border-border bg-background/80 p-0.5 shadow-sm backdrop-blur',
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const active = language === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            title={t(option.fullKey)}
            onClick={() => setLanguage(option.value)}
            className={cn(
              'h-7 cursor-pointer rounded-full px-3 text-xs font-semibold tracking-wide transition-colors duration-fast',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {t(option.shortKey)}
          </button>
        )
      })}
    </div>
  )
}
