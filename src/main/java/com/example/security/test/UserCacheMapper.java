//package com.example.security.test;
//
//import com.example.security.Users.User;
//import com.example.security.Users.User1.User1;
//
//public class UserCacheMapper {
//
//    public static UserCacheDTO toDTO(User user) {
//        if (user == null) {
//            return null;
//        }
//
//        // ✅ Map User1 profile safely (avoid lazy loading issues)
//        UserCacheDTO.User1ProfileDTO profileDTO = null;
//        if (user.getUser1Profile() != null) {
//            User1 profile = user.getUser1Profile();
//            profileDTO = UserCacheDTO.User1ProfileDTO.builder()
//                    .id(profile.getId())
//                    .bio(profile.getBio())
//                    .phone(profile.getPhone())
//                    .location(profile.getLocation())
//                    .active(profile.isActive())
//                    .build();
//        }
//
//        return UserCacheDTO.builder()
//                .id(user.getId())
//                .firstname(user.getFirstname())
//                .lastname(user.getLastname())
//                .email(user.getEmail())
//                .status(user.getStatus())
//                .defaultRole(user.getDefaultRole())
//                .roles(user.getRoles()) // ✅ This is EAGER, so it's safe
//                // .isFreeSubscribed(user.isFreeSubscribed())
//                // .isStandardSubscribed(user.isStandardSubscribed())
//                // .isPremiumSubscribed(user.isPremiumSubscribed())
//                // .currentPlan(user.getCurrentPlan())
//                // .subscriptionExpiresAt(user.getSubscriptionExpiresAt())
//                .user1Profile(profileDTO) // ✅ Mapped safely
//                .build();
//    }
//}