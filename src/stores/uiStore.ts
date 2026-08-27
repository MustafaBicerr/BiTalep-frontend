import { create } from 'zustand'

const SIDEBAR_KEY = 'bitalep-sidebar-collapsed'

function readSidebarCollapsed(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(SIDEBAR_KEY) === 'true'
}

interface UiState {
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  globalSearchOpen: boolean
  notificationPanelOpen: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setMobileMenuOpen: (open: boolean) => void
  setGlobalSearchOpen: (open: boolean) => void
  setNotificationPanelOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarCollapsed: readSidebarCollapsed(),
  mobileMenuOpen: false,
  globalSearchOpen: false,
  notificationPanelOpen: false,
  setSidebarCollapsed: (collapsed) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SIDEBAR_KEY, String(collapsed))
    }
    set({ sidebarCollapsed: collapsed })
  },
  toggleSidebar: () => {
    const next = !get().sidebarCollapsed
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SIDEBAR_KEY, String(next))
    }
    set({ sidebarCollapsed: next })
  },
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setGlobalSearchOpen: (open) => set({ globalSearchOpen: open }),
  setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),
}))
