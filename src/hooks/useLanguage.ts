import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { AppLanguage } from '@/lib/i18n'

const STORAGE_KEY = 'bitalep-language'

export function useLanguage() {
  const { i18n } = useTranslation()

  const language: AppLanguage = i18n.language?.startsWith('en') ? 'en' : 'tr'

  const setLanguage = useCallback(
    (lng: AppLanguage) => {
      void i18n.changeLanguage(lng)
      try {
        localStorage.setItem(STORAGE_KEY, lng)
      } catch {
        /* ignore */
      }
      document.documentElement.lang = lng
    },
    [i18n],
  )

  return { language, setLanguage, languages: ['tr', 'en'] as const }
}
