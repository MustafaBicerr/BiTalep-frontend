import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import commonTr from '@/locales/tr/common.json'
import navTr from '@/locales/tr/nav.json'
import dashboardTr from '@/locales/tr/dashboard.json'
import requestsTr from '@/locales/tr/requests.json'
import formsTr from '@/locales/tr/forms.json'
import statusTr from '@/locales/tr/status.json'
import notificationsTr from '@/locales/tr/notifications.json'
import errorsTr from '@/locales/tr/errors.json'
import settingsTr from '@/locales/tr/settings.json'
import profileTr from '@/locales/tr/profile.json'

import commonEn from '@/locales/en/common.json'
import navEn from '@/locales/en/nav.json'
import dashboardEn from '@/locales/en/dashboard.json'
import requestsEn from '@/locales/en/requests.json'
import formsEn from '@/locales/en/forms.json'
import statusEn from '@/locales/en/status.json'
import notificationsEn from '@/locales/en/notifications.json'
import errorsEn from '@/locales/en/errors.json'
import settingsEn from '@/locales/en/settings.json'
import profileEn from '@/locales/en/profile.json'

export const NAMESPACES = [
  'common',
  'nav',
  'dashboard',
  'requests',
  'forms',
  'status',
  'notifications',
  'errors',
  'settings',
  'profile',
] as const

export type AppLanguage = 'tr' | 'en'

const resources = {
  tr: {
    common: commonTr,
    nav: navTr,
    dashboard: dashboardTr,
    requests: requestsTr,
    forms: formsTr,
    status: statusTr,
    notifications: notificationsTr,
    errors: errorsTr,
    settings: settingsTr,
    profile: profileTr,
  },
  en: {
    common: commonEn,
    nav: navEn,
    dashboard: dashboardEn,
    requests: requestsEn,
    forms: formsEn,
    status: statusEn,
    notifications: notificationsEn,
    errors: errorsEn,
    settings: settingsEn,
    profile: profileEn,
  },
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'tr',
    defaultNS: 'common',
    ns: [...NAMESPACES],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'bitalep-language',
      caches: ['localStorage'],
    },
    missingKeyHandler: (_lngs, ns, key) => {
      console.warn(`[i18n] Missing key: ${ns}:${key}`)
    },
    saveMissing: true,
    react: { useSuspense: false },
  })

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng.startsWith('en') ? 'en' : 'tr'
})

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language?.startsWith('en') ? 'en' : 'tr'
}

export default i18n
