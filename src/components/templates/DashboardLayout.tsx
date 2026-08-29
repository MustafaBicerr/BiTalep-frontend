import { useEffect, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '@/components/organisms/Header'
import { Sidebar } from '@/components/organisms/Sidebar'
import { GlobalSearch } from '@/components/organisms/GlobalSearch'
import { NotificationCenter } from '@/components/organisms/NotificationCenter'
import { useUiStore } from '@/stores/uiStore'

export function DashboardLayout({ children }: { children?: ReactNode }) {
  const { t } = useTranslation('common')
  const mainRef = useRef<HTMLElement>(null)
  const location = useLocation()
  const setGlobalSearchOpen = useUiStore((s) => s.setGlobalSearchOpen)

  useEffect(() => {
    mainRef.current?.focus()
  }, [location.pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setGlobalSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setGlobalSearchOpen])

  return (
    <div className="flex h-dvh overflow-hidden bg-muted/40">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2"
      >
        {t('skipToContent')}
      </a>
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header />
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto outline-none p-4 md:p-6 xl:p-8"
        >
          {children ?? <Outlet />}
        </main>
      </div>
      <GlobalSearch />
      <NotificationCenter />
    </div>
  )
}
