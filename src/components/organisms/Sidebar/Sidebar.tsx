import {
  Bell,
  FileText,
  FolderOpen,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Settings,
  User,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { Logo } from '@/components/atoms/Logo'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { UserRole } from '@/types/enums'
import { cn } from '@/utils/cn'

interface NavItem {
  to: string
  labelKey: string
  icon: typeof LayoutDashboard
  roles: UserRole[]
  emphasize?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.PERSONEL] },
  { to: '/requests/new', labelKey: 'newRequest', icon: PlusCircle, roles: [UserRole.PERSONEL], emphasize: true },
  { to: '/requests', labelKey: 'myRequests', icon: FileText, roles: [UserRole.PERSONEL] },
  { to: '/requests', labelKey: 'allRequests', icon: FileText, roles: [UserRole.ADMIN] },
  { to: '/users', labelKey: 'userManagement', icon: Users, roles: [UserRole.ADMIN] },
  { to: '/files', labelKey: 'myFiles', icon: FolderOpen, roles: [UserRole.PERSONEL] },
  { to: '/notifications', labelKey: 'notifications', icon: Bell, roles: [UserRole.ADMIN, UserRole.PERSONEL] },
]

const BOTTOM_ITEMS: NavItem[] = [
  { to: '/settings', labelKey: 'settings', icon: Settings, roles: [UserRole.ADMIN] },
  { to: '/profile', labelKey: 'profile', icon: User, roles: [UserRole.ADMIN, UserRole.PERSONEL] },
]

function NavList({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { t } = useTranslation('nav')
  const role = useAuthStore((s) => s.user?.role) ?? UserRole.PERSONEL

  const renderItem = (item: NavItem) => {
    if (!item.roles.includes(role)) return null
    const link = (
      <NavLink
        to={item.to}
        end={item.to === '/'}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
            collapsed && 'justify-center px-0',
            isActive
              ? 'bg-primary-subtle text-primary'
              : 'text-secondary-foreground/90 hover:bg-white/10',
            item.emphasize && !isActive && 'text-primary',
          )
        }
      >
        {({ isActive }) => (
          <>
            <item.icon className="h-5 w-5 shrink-0" aria-hidden />
            {!collapsed ? <span>{t(item.labelKey)}</span> : null}
            {isActive ? <span className="sr-only" aria-current="page" /> : null}
          </>
        )}
      </NavLink>
    )

    if (!collapsed) return <li key={`${item.to}-${item.labelKey}`}>{link}</li>

    return (
      <li key={`${item.to}-${item.labelKey}`}>
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">{t(item.labelKey)}</TooltipContent>
        </Tooltip>
      </li>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <nav className="flex h-full flex-col">
        <ul className="flex flex-1 flex-col gap-1 p-3">{NAV_ITEMS.map(renderItem)}</ul>
        <Separator className="bg-white/10" />
        <ul className="flex flex-col gap-1 p-3">{BOTTOM_ITEMS.map(renderItem)}</ul>
      </nav>
    </TooltipProvider>
  )
}

function SidebarChrome({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation('nav')
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  return (
    <aside
      className={cn(
        'hidden h-screen flex-col bg-secondary text-secondary-foreground transition-[width] duration-200 lg:flex',
        collapsed ? 'w-20' : 'w-[280px]',
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 border-b border-white/10 px-3">
        <div
          className={cn(
            'flex items-center justify-center rounded-md bg-white shadow-sm',
            collapsed ? 'h-10 w-10 p-1' : 'h-10 px-2 py-1',
          )}
        >
          {collapsed ? <Logo variant="icon" size={28} /> : <Logo variant="full" size={26} />}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-secondary-foreground hover:bg-white/10"
          onClick={toggleSidebar}
          aria-label={collapsed ? t('expand') : t('collapse')}
        >
          {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </Button>
      </div>
      <NavList collapsed={collapsed} />
    </aside>
  )
}

export function Sidebar() {
  const { t } = useTranslation('nav')
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const mobileOpen = useUiStore((s) => s.mobileMenuOpen)
  const setMobileMenuOpen = useUiStore((s) => s.setMobileMenuOpen)

  return (
    <>
      <SidebarChrome collapsed={collapsed} />
      <Sheet open={mobileOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] border-0 bg-secondary p-0 text-secondary-foreground">
          <div className="flex h-16 items-center px-4">
            <div className="flex h-10 items-center rounded-md bg-white px-2 py-1 shadow-sm">
              <Logo variant="full" size={26} />
            </div>
            <span className="sr-only">{t('closeMenu')}</span>
          </div>
          <NavList collapsed={false} onNavigate={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
