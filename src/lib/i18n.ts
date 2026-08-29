import i18n from 'i18next'
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
import approvalsTr from '@/locales/tr/approvals.json'
import reportsTr from '@/locales/tr/reports.json'
import companyTr from '@/locales/tr/company.json'

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
import approvalsEn from '@/locales/en/approvals.json'
import reportsEn from '@/locales/en/reports.json'
import companyEn from '@/locales/en/company.json'

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
  'approvals',
  'reports',
  'company',
] as const

export type AppLanguage = 'tr' | 'en'

export const LANGUAGE_STORAGE_KEY = 'bitalep-language'
export const DEFAULT_LANGUAGE: AppLanguage = 'tr'

/** Only an explicit user choice can move away from Turkish; device locale is ignored. */
function resolveInitialLanguage(): AppLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored === 'tr' || stored === 'en') return stored
  } catch {
    /* localStorage unavailable */
  }
  return DEFAULT_LANGUAGE
}

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
    approvals: approvalsTr,
    reports: reportsTr,
    company: companyTr,
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
    approvals: approvalsEn,
    reports: reportsEn,
    company: companyEn,
  },
}

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: resolveInitialLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: ['tr', 'en'],
    defaultNS: 'common',
    ns: [...NAMESPACES],
    interpolation: { escapeValue: false },
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
