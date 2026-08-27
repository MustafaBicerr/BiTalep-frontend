import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockConfig } from '@/mock/config/mock.config'
import { mockStore } from '@/mock/store/MockStore'
import type { UserResponse } from '@/types/user.types'

interface AuthState {
  token: string | null
  user: UserResponse | null
  isAuthenticated: boolean
  setAuth: (token: string, user: UserResponse) => void
  setUser: (user: UserResponse) => void
  clearAuth: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => {
        if (mockConfig.mode !== 'real') {
          mockStore.setSessionFromToken(token)
        }
        set({ token, user, isAuthenticated: true })
      },
      setUser: (user) => set({ user }),
      clearAuth: () => {
        if (mockConfig.mode !== 'real') {
          mockStore.clearSession()
        }
        set({ token: null, user: null, isAuthenticated: false })
      },
      logout: () => {
        if (mockConfig.mode !== 'real') {
          mockStore.clearSession()
        }
        set({ token: null, user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'bitalep-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && mockConfig.mode !== 'real') {
          mockStore.setSessionFromToken(state.token)
        }
      },
    },
  ),
)
