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

  login: (data: LoginFormData) =>
    api.post<{
      email: string;
      role: string;
      logoPath?: string;
      message?: string;
    }>('/v1/auth/authenticate', data),

  register: (data: Omit<RegisterFormData, 'confirmPassword'>) =>
    api.post<{
      email: string;
      role: string;
      message: string;
      logoPath?: string;
    }>('/v1/auth/register', data),

  logout: () => api.post('/v1/auth/logout'),

  refresh: () =>
    api.post<{
      email: string;
      role: string;
    }>('/v1/auth/refresh'),

  // ========================================
  // TIKTOK OAuth
  // ========================================

  /**
   * Get TikTok OAuth URL
   * Frontend redirects to the returned authUrl
   */
  loginWithTikTok: () =>
    api.get<{
      authUrl: string;
      state: string;
    }>('/v1/auth/tiktok/init'),

  // ========================================
  // EMAIL VERIFICATION
  // ========================================

  verifyEmail: (data: VerificationFormData) =>
    api.post<{
      message: string;
      email: string;
    }>('/v1/auth/verify-email', data),

  resendVerificationCode: (data: ResendVerificationData) =>
    api.post<{
      message: string;
      email: string;
    }>('/v1/auth/resend-verification', data),

  // ========================================
  // PASSWORD RESET
  // ========================================

  forgotPassword: (data: ForgotPasswordFormData) =>
    api.post<{
      message: string;
    }>('/v1/auth/forgot-password', { email: data.email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<{
      message: string;
    }>('/v1/auth/reset-password', null, {
      params: { token, newPassword }
    }),

  // ========================================
  // USER PROFILE
  // ========================================

  profile: () =>
    api.get<{
      id: number;
      email: string;
      role: string;
      firstname: string;
      lastname: string;
      status: string;
      logoPath?: string;
      hasPlayerProfile: boolean;
      hasSuperAdminProfile: boolean;
    }>('/v1/shared/profile/me'),
};