import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authApi } from '../api/auth'
import { handleApiError } from '../utils/errors'
import logger from '../utils/logger'

// ========================================
// STORAGE VERSION
// Bump this number any time you change the
// User interface or partialize shape.
// Zustand will auto-clear old localStorage.
// ========================================
const STORE_VERSION = 2

// ========================================
// USER INTERFACE
// ========================================
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
}

// ========================================
// AUTH STORE INTERFACE
// ========================================
interface AuthStore {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

// ========================================
// ROLE-BASED REDIRECT HELPER
// ========================================
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

// ========================================
// AUTH STORE
// ========================================
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

          // ✅ Safety: clear stale user if role is missing (old schema)
          const currentUser = get().user
          if (currentUser && !currentUser.role) {
            logger.auth('Stale user without role - clearing')
            set({ user: null })
          }

          // ✅ Always fetch fresh from API - cookie is source of truth
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

      // ✅ VERSION: bump STORE_VERSION above when User shape changes
      // Zustand will automatically wipe old localStorage and start fresh
      version: STORE_VERSION,

      // ✅ MIGRATE: called when stored version != current version
      // Return empty state to force a clean slate
      migrate: (persistedState, oldVersion) => {
        logger.auth(`Auth store migrated from v${oldVersion} to v${STORE_VERSION} - session cleared`)
        return { user: null, isLoading: true }
      },

      // ✅ Only persist what's needed for instant UI render + routing
      // Everything is always overwritten by fresh API data in checkAuth
      partialize: (state) => ({
        user: state.user
          ? {
              email: state.user.email,
              firstname: state.user.firstname,
              lastname: state.user.lastname,
              logoPath: state.user.logoPath,
              role: state.user.role,                           // ✅ for getDashboardPath
              hasPlayerProfile: state.user.hasPlayerProfile,  // ✅ for player routing
              hasSuperAdminProfile: state.user.hasSuperAdminProfile,
            }
          : null,
      }),
    }
  )
)