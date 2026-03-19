//package com.example.security.test;
//
//import java.io.Serializable;
//import java.time.LocalDateTime;
//import java.util.List;
//
//import com.example.security.Users.Role;
//import com.example.security.Users.UserStatus;
//// import com.example.security.Users.User.SubscriptionPlanType;
//import com.fasterxml.jackson.annotation.JsonTypeInfo;
//
//import lombok.AllArgsConstructor;
//import lombok.Builder;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//@Data
//@Builder
//@NoArgsConstructor
//@AllArgsConstructor
//@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS)
//public class UserCacheDTO implements Serializable {
//
//    private static final long serialVersionUID = 1L;
//
//    private Long id;
//    private String firstname;
//    private String lastname;
//    private String email;
//
//    private UserStatus status;
//    private Role defaultRole;
//    private List<Role> roles;
//
//    // Subscription fields
//    private boolean isFreeSubscribed;
//    private boolean isStandardSubscribed;
//    private boolean isPremiumSubscribed;
//    // private SubscriptionPlanType currentPlan;
//    private LocalDateTime subscriptionExpiresAt;
//
//    // ✅ NEW: Add User1 profile info (if needed)
//    private User1ProfileDTO user1Profile;
//
//    // Inner DTO for User1 profile
//    @Data
//    @Builder
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class User1ProfileDTO implements Serializable {
//        private static final long serialVersionUID = 1L;
//
//        private Long id;
//        private String bio;
//        private String phone;
//        private String location;
//        private boolean active;
//    }
//}