// com.example.security.dto.mapper.AdminMapper.java
package com.example.security.dto.mapper;


import com.example.security.Users.Admin.Admin;
import com.example.security.dto.response.AdminResponse;
import org.springframework.stereotype.Component;

@Component
public class AdminMapper {

    public AdminResponse toResponse(Admin admin) {
        if (admin == null) return null;

        return AdminResponse.builder()
                .id(admin.getId())
                .userId(admin.getUser().getId())
                .email(admin.getUser().getEmail())
                .favoriteColor(admin.getFavoriteColor())
                .luckyNumber(admin.getLuckyNumber())
                .isSuperAdmin(admin.getIsSuperAdmin())
                .notes(admin.getNotes())
                .build();
    }
}
