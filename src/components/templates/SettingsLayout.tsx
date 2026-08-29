import { Bell, Globe, Lock, Palette } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { interactiveChip, interactiveRow } from '@/utils/interactive'

const SECTIONS: Array<{
  to: string
  end?: boolean
  key: 'general' | 'notifications' | 'security' | 'appearance'
  icon: typeof Globe
}> = [
  { to: '/settings', end: true, key: 'general', icon: Globe },
  { to: '/settings/notifications', key: 'notifications', icon: Bell },
  { to: '/settings/security', key: 'security', icon: Lock },
  { to: '/settings/appearance', key: 'appearance', icon: Palette },
]

export function SettingsLayout() {
  const { t } = useTranslation('settings')

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 md:flex-row">
      <aside className="hidden w-[240px] shrink-0 md:block">
        <h1 className="mb-4 text-h2">{t('title')}</h1>
        <nav>
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.key}>
                <NavLink
                  to={s.to}
                  end={s.end}
                  className={({ isActive }) =>
                    cn(
                      'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium',
                      interactiveRow,
                      isActive
                        ? 'bg-primary-subtle text-primary hover:bg-primary-subtle'
                        : 'text-muted-foreground hover:text-foreground',
                    )
                  }
                >
                  <s.icon className="h-4 w-4" />
                  {t(s.key)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex gap-2 overflow-x-auto md:hidden">
          {SECTIONS.map((s) => (
            <NavLink
              key={s.key}
              to={s.to}
              end={s.end}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap rounded-md px-3 py-2 text-sm',
                  interactiveChip,
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                )
              }
            >
              {t(s.key)}
            </NavLink>
          ))}
        </div>
        <Outlet />
      </div>
    </div>
  )
}
