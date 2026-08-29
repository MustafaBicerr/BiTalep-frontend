import { Bell, Menu, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { useUnreadCount } from '@/hooks/useNotifications'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { cn } from '@/utils/cn'

export function Header() {
  const { t } = useTranslation(['common', 'nav', 'profile', 'notifications'])
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { logout } = useAuth()
  const setMobileMenuOpen = useUiStore((s) => s.setMobileMenuOpen)
  const setGlobalSearchOpen = useUiStore((s) => s.setGlobalSearchOpen)
  const setNotificationPanelOpen = useUiStore((s) => s.setNotificationPanelOpen)
  const { data: unread = 0 } = useUnreadCount()

  const initials = user ? `${user.name[0] ?? ''}${user.surname[0] ?? ''}`.toUpperCase() : '?'

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={t('nav:openMenu')}
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="hidden h-10 min-w-[220px] justify-start gap-2 text-muted-foreground md:inline-flex"
          onClick={() => setGlobalSearchOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span>{t('common:search.placeholder')}</span>
          <kbd className="ml-auto rounded border border-border px-1.5 text-[10px]">⌘K</kbd>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={t('common:actions.search')}
          onClick={() => setGlobalSearchOpen(true)}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 sm:flex">
          <LanguageSwitcher />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={t('notifications:open')}
            onClick={() => setNotificationPanelOpen(true)}
          >
            <Bell className="h-5 w-5" />
            {unread > 0 ? (
              <span
                className={cn('absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive')}
                aria-live="polite"
              />
            ) : null}
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="relative h-9 w-9 rounded-full p-0"
              aria-label={t('profile:openMenu')}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px]">
            <DropdownMenuItem asChild>
              <Link to="/profile">{t('profile:viewProfile')}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">{t('profile:settings')}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="sm:hidden"
              onClick={() => setNotificationPanelOpen(true)}
            >
              {t('nav:notifications')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                void logout().finally(() => {
                  navigate('/login', { replace: true })
                })
              }}
            >
              {t('profile:logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
