import { format, formatDistanceToNow, parseISO, type Locale } from 'date-fns'
import { enUS, tr } from 'date-fns/locale'

const locales: Record<'tr' | 'en', Locale> = {
  tr,
  en: enUS,
}

function resolveLocale(lang?: string): Locale {
  const key = lang?.startsWith('en') ? 'en' : 'tr'
  return locales[key]
}

/** Format ISO date: 27 Ağustos 2026 / August 27, 2026 */
export function formatDate(iso: string, lang: string = 'tr'): string {
  const date = typeof iso === 'string' ? parseISO(iso) : iso
  return format(date, 'd MMMM yyyy', { locale: resolveLocale(lang) })
}

/** Format ISO datetime: 27.08.2026 14:30 */
export function formatDateTime(iso: string, lang: string = 'tr'): string {
  const date = typeof iso === 'string' ? parseISO(iso) : iso
  return format(date, 'dd.MM.yyyy HH:mm', { locale: resolveLocale(lang) })
}

/** Relative time: 2 saat önce / 2 hours ago */
export function formatRelative(iso: string, lang: string = 'tr'): string {
  const date = typeof iso === 'string' ? parseISO(iso) : iso
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: resolveLocale(lang),
  })
}
