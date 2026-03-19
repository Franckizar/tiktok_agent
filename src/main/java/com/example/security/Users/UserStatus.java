package com.example.security.Users;

/**
 * User account status enum
 * 
 * Flow:
 * UNVERIFIED → (email verification) → PENDING → (admin approval) → ACTIVE
 * 
 * Or for open registration:
 * UNVERIFIED → (email verification) → ACTIVE
 */
public enum UserStatus {
    /**
     * User just registered, email NOT verified yet
     * - Cannot log in
     * - Must verify email within 24 hours or account gets deleted
     */
    UNVERIFIED,
    
    /**
     * Email verified, waiting for admin approval
     * - Cannot log in yet
     * - Admin needs to approve and assign role
     */
    PENDING,
    
    /**
     * Fully activated user
     * - Can log in
     * - Has all permissions
     */
    ACTIVE,
    
    /**
     * Temporarily disabled by admin
     * - Cannot log in
     * - Can be reactivated
     */
    SUSPENDED,
    
    /**
     * Permanently banned
     * - Cannot log in
     * - Cannot be reactivated
     */
    BANNED
}