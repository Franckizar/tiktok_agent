import { api } from './index';
import type {
  LoginFormData,
  RegisterFormData,
  VerificationFormData,
  ResendVerificationData,
  ForgotPasswordFormData,
} from '../validations/auth';

export const authApi = {

  // ========================================
  // AUTHENTICATION
  // ========================================

  /**
   * Login user
   * Returns: { email, role, logoPath }
   * Cookies are set automatically by backend
   */
  login: (data: LoginFormData) =>
    api.post<{
      email: string;
      role: string;
      logoPath?: string;
      message?: string;
    }>('/v1/auth/authenticate', data),

  /**
   * Register new user
   * No role field - system assigns automatically
   * First user = SUPERADMIN, everyone else = UNREG + UNVERIFIED
   */
  register: (data: Omit<RegisterFormData, 'confirmPassword'>) =>
    api.post<{
      email: string;
      role: string;
      message: string;
      logoPath?: string;
    }>('/v1/auth/register', data),

  /**
   * Logout user - clears authentication cookies
   */
  logout: () => api.post('/v1/auth/logout'),

  /**
   * Refresh access token using refresh token from cookie
   */
  refresh: () =>
    api.post<{
      email: string;
      role: string;
    }>('/v1/auth/refresh'),

  // ========================================
  // EMAIL VERIFICATION
  // ========================================

  /**
   * Verify email with 6-digit code
   * Changes user status from UNVERIFIED to PENDING
   */
  verifyEmail: (data: VerificationFormData) =>
    api.post<{
      message: string;
      email: string;
    }>('/v1/auth/verify-email', data),

  /**
   * Resend verification code
   * Invalidates old code and sends new one
   */
  resendVerificationCode: (data: ResendVerificationData) =>
    api.post<{
      message: string;
      email: string;
    }>('/v1/auth/resend-verification', data),

  // ========================================
  // PASSWORD RESET
  // ========================================

  /**
   * Initiate password reset - sends reset link to email
   */
  forgotPassword: (data: ForgotPasswordFormData) =>
    api.post<{
      message: string;
    }>('/v1/auth/forgot-password', { email: data.email }),

  /**
   * Complete password reset using token from email link
   */
  resetPassword: (token: string, newPassword: string) =>
    api.post<{
      message: string;
    }>('/v1/auth/reset-password', null, {
      params: { token, newPassword }
    }),

  // ========================================
  // USER PROFILE
  // ========================================

  /**
   * Get current authenticated user profile
   * Used by auth store to verify session and load user data
   * hasPlayerProfile and hasSuperAdminProfile tell the
   * frontend which dashboard to redirect to
   */
  profile: () =>
    api.get<{
      id: number;
      email: string;
      role: string;
      firstname: string;
      lastname: string;
      status: string;
      logoPath?: string;
      // ✅ NEW: Profile flags for dashboard routing
      hasPlayerProfile: boolean;
      hasSuperAdminProfile: boolean;
    }>('/v1/shared/profile/me'),
};