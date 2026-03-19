import { z } from 'zod';

// ========================================
// LOGIN SCHEMA
// ========================================
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// ========================================
// REGISTER SCHEMA
// Role is removed - system assigns it automatically
// First user = SUPERADMIN, everyone else = UNREG pending verification
// ========================================
export const registerSchema = z.object({
  firstname: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name is too long'),

  lastname: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name is too long'),

  email: z.string()
    .email('Invalid email address')
    .toLowerCase(),

  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),

  confirmPassword: z.string()
    .min(6, 'Password must be at least 6 characters'),

  // Optional profile image
  logoImage: z.string().optional(),

}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ========================================
// EMAIL VERIFICATION SCHEMA
// ========================================
export const verificationSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string()
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only digits'),
});

// ========================================
// RESEND VERIFICATION SCHEMA
// ========================================
export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// ========================================
// FORGOT PASSWORD SCHEMA
// ========================================
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// ========================================
// RESET PASSWORD SCHEMA
// ======================================== 
export const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
  confirmPassword: z.string()
    .min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ========================================
// TYPE EXPORTS
// ========================================
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type VerificationFormData = z.infer<typeof verificationSchema>;
export type ResendVerificationData = z.infer<typeof resendVerificationSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;