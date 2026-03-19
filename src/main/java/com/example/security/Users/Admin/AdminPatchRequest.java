package com.example.security.Users.Admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPatchRequest {
    private String favoriteColor;
    private Integer luckyNumber;
    private Boolean isSuperAdmin;
    private String notes;
}