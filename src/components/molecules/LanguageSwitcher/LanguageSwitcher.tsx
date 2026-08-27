import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguage } from '@/hooks/useLanguage'

export function LanguageSwitcher() {
  const { t } = useTranslation('common')
  const { language, setLanguage } = useLanguage()

  return (
    <Select value={language} onValueChange={(v) => setLanguage(v as 'tr' | 'en')}>
      <SelectTrigger className="h-9 w-[100px]" aria-label={t('language.label')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="tr">{t('language.tr')}</SelectItem>
        <SelectItem value="en">{t('language.en')}</SelectItem>
      </SelectContent>
    </Select>
  )
}
