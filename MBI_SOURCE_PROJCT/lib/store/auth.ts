import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authApi } from '../api/auth'
import { handleApiError } from '../utils/errors'
import logger from '../utils/logger'

const STORE_VERSION = 3 // ← bumped from 2

interface User {
  id?: number
  email: string
  role: string
  firstname?: string
  lastname?: string
  status?: string
  logoPath?: string
  hasPlayerProfile?: boolean
  hasSuperAdminProfile?: boolean
  // TikTok profile
  tiktokId?: string
  displayName?: string
  avatarUrl?: string
  tiktokBio?: string
  tiktokProfileLink?: string
  tiktokConnected?: boolean
  tiktokVerified?: boolean
  // TikTok stats
  tiktokFollowerCount?: number
  tiktokFollowingCount?: number
  tiktokLikesCount?: number
  tiktokVideoCount?: number
}

interface AuthStore {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export function getDashboardPath(user: User): string {
  const role = user.role?.toUpperCase()

  switch (role) {
    case 'SUPERADMIN':
      return '/dashboard/superadmin'
    case 'ADMIN':
      return '/dashboard/admin'
    case 'PLAYER':
      if (!user.hasPlayerProfile) {
        return '/dashboard/player/setup'
      }
      return '/dashboard/player'
    case 'UNREG':
    default:
      return '/pending'
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,

      setUser: (user) => {
        logger.auth('Setting user', user?.email)
        set({ user })
      },

      setLoading: (loading) => set({ isLoading: loading }),

      logout: async () => {
        logger.auth('Logging out...')
        try {
          await authApi.logout()
          logger.success('Logout successful')
        } catch (err) {
          const appError = handleApiError(err)
          logger.error('Logout failed', appError)
        } finally {
          set({ user: null, isLoading: false })
          window.location.href = '/login'
        }
      },

      checkAuth: async () => {
        logger.auth('Checking authentication with API...')

        try {
          set({ isLoading: true })

          const currentUser = get().user
          if (currentUser && !currentUser.role) {
            logger.auth('Stale user without role - clearing')
            set({ user: null })
          }

          const { data } = await authApi.profile()

          logger.success('Auth verified', {
            email: data.email,
            role: data.role,
          })

          set({
            user: {
              id: data.id,
              email: data.email,
              role: data.role,
              firstname: data.firstname,
              lastname: data.lastname,
              status: data.status,
              logoPath: data.logoPath,
              hasPlayerProfile: data.hasPlayerProfile,
              hasSuperAdminProfile: data.hasSuperAdminProfile,
              // TikTok profile
              tiktokId: data.tiktokId,
              displayName: data.displayName,
              avatarUrl: data.avatarUrl,
              tiktokBio: data.tiktokBio,
              tiktokProfileLink: data.tiktokProfileLink,
              tiktokConnected: data.tiktokConnected,
              tiktokVerified: data.tiktokVerified,
              // TikTok stats
              tiktokFollowerCount: data.tiktokFollowerCount,
              tiktokFollowingCount: data.tiktokFollowingCount,
              tiktokLikesCount: data.tiktokLikesCount,
              tiktokVideoCount: data.tiktokVideoCount,
            },
            isLoading: false,
          })
        } catch (err) {
          const appError = handleApiError(err)
          logger.error('Auth check failed - clearing session', appError)
          set({ user: null, isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      version: STORE_VERSION,
      migrate: (persistedState, oldVersion) => {
        logger.auth(`Auth store migrated from v${oldVersion} to v${STORE_VERSION} - session cleared`)
        return { user: null, isLoading: true }
      },
      partialize: (state) => ({
        user: state.user
          ? {
              email: state.user.email,
              firstname: state.user.firstname,
              lastname: state.user.lastname,
              logoPath: state.user.logoPath,
              role: state.user.role,
              hasPlayerProfile: state.user.hasPlayerProfile,
              hasSuperAdminProfile: state.user.hasSuperAdminProfile,
              // TikTok fields needed for instant UI
              displayName: state.user.displayName,
              avatarUrl: state.user.avatarUrl,
              tiktokConnected: state.user.tiktokConnected,
              tiktokFollowerCount: state.user.tiktokFollowerCount,
              tiktokFollowingCount: state.user.tiktokFollowingCount,
              tiktokLikesCount: state.user.tiktokLikesCount,
              tiktokVideoCount: state.user.tiktokVideoCount,
            }
          : null,
      }),
    }
  )
)