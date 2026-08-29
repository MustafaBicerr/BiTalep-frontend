import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGE_STORAGE_KEY, type AppLanguage } from '@/lib/i18n'

export function useLanguage() {
  const { i18n } = useTranslation()

  const language: AppLanguage = i18n.language?.startsWith('en') ? 'en' : 'tr'

  const setLanguage = useCallback(
    (lng: AppLanguage) => {
      void i18n.changeLanguage(lng)
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lng)
      } catch {
        /* ignore */
      }
      document.documentElement.lang = lng
    },
    [i18n],
  )

  return { language, setLanguage, languages: ['tr', 'en'] as const }
}
