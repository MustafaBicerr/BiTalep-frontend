import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockConfig } from '@/mock/config/mock.config'
import { mockStore } from '@/mock/store/MockStore'
import type { UserResponse } from '@/types/user.types'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: UserResponse | null
  isAuthenticated: boolean
  setAuth: (token: string, user: UserResponse, refreshToken?: string | null) => void
  setTokens: (token: string, refreshToken?: string | null) => void
  setUser: (user: UserResponse) => void
  clearAuth: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user, refreshToken) => {
        if (mockConfig.mode !== 'real') {
          mockStore.setSessionFromToken(token)
        }
        set({
          token,
          user,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
        })
      },
      setTokens: (token, refreshToken) => {
        set((state) => ({
          token,
          refreshToken: refreshToken === undefined ? state.refreshToken : refreshToken,
        }))
      },
      setUser: (user) => set({ user }),
      clearAuth: () => {
        if (mockConfig.mode !== 'real') {
          mockStore.clearSession()
        }
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false })
      },
      logout: () => {
        if (mockConfig.mode !== 'real') {
          mockStore.clearSession()
        }
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'bitalep-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
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
