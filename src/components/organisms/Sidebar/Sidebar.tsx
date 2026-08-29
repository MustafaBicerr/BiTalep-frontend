import {
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  LayoutDashboard,
  PlusCircle,
  Settings,
  User,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
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
  { to: '/approvals', labelKey: 'approvals', icon: ClipboardCheck, roles: [UserRole.ADMIN] },
  { to: '/requests', labelKey: 'allRequests', icon: FileText, roles: [UserRole.ADMIN] },
  { to: '/reports', labelKey: 'reports', icon: FileSpreadsheet, roles: [UserRole.ADMIN] },
  { to: '/users', labelKey: 'userManagement', icon: Users, roles: [UserRole.ADMIN] },
  { to: '/files', labelKey: 'myFiles', icon: FolderOpen, roles: [UserRole.PERSONEL] },
  { to: '/notifications', labelKey: 'notifications', icon: Bell, roles: [UserRole.ADMIN, UserRole.PERSONEL] },
]

const BOTTOM_ITEMS: NavItem[] = [
  { to: '/company', labelKey: 'company', icon: Building2, roles: [UserRole.ADMIN] },
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
            'flex h-10 shrink-0 cursor-pointer items-center rounded-md text-sm font-medium leading-none transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
            collapsed
              ? 'mx-auto size-10 justify-center gap-0 p-0'
              : 'gap-3 px-3',
            isActive
              ? 'bg-primary-subtle text-primary'
              : 'text-secondary-foreground/90 hover:bg-white/10 hover:text-secondary-foreground active:bg-white/[0.15]',
            item.emphasize && !isActive && 'text-primary',
          )
        }
      >
        {() => (
          <>
            <item.icon className="h-5 w-5 shrink-0" aria-hidden />
            {!collapsed ? <span>{t(item.labelKey)}</span> : null}
          </>
        )}
      </NavLink>
    )

    if (!collapsed) return <li key={`${item.to}-${item.labelKey}`} className="shrink-0">{link}</li>

    return (
      <li key={`${item.to}-${item.labelKey}`} className="shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">{t(item.labelKey)}</TooltipContent>
        </Tooltip>
      </li>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <nav className="flex min-h-0 flex-1 flex-col">
        <ul className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
          {NAV_ITEMS.map(renderItem)}
        </ul>
        <Separator className="bg-white/10" />
        <ul className="flex shrink-0 flex-col gap-3 p-3">
          {BOTTOM_ITEMS.map(renderItem)}
        </ul>
      </nav>
    </TooltipProvider>
  )
}

function SidebarLogo({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation('common')
  return (
    <img
      src={collapsed ? '/logo-sidebar-icon.png' : '/logo-sidebar.png'}
      alt={t('appName')}
      className={
        collapsed
          ? 'h-8 w-8 shrink-0 object-contain'
          : 'h-9 w-auto max-w-[168px] shrink-0 object-contain object-left'
      }
    />
  )
}

function SidebarChrome({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation('nav')
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-full shrink-0 flex-col self-stretch bg-secondary text-secondary-foreground transition-[width] duration-200 lg:flex',
        collapsed ? 'w-20' : 'w-[280px]',
      )}
    >
      <div
        className={cn(
          'relative flex h-16 items-center border-b border-white/10',
          collapsed ? 'justify-center px-2' : 'justify-between gap-2 px-3',
        )}
      >
        <SidebarLogo collapsed={collapsed} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'shrink-0 cursor-pointer text-secondary-foreground/80 transition-colors hover:bg-white/10 hover:text-secondary-foreground',
            collapsed && 'absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2',
          )}
          onClick={toggleSidebar}
          aria-label={collapsed ? t('expand') : t('collapse')}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
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
            <SidebarLogo collapsed={false} />
            <span className="sr-only">{t('closeMenu')}</span>
          </div>
          <NavList collapsed={false} onNavigate={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
