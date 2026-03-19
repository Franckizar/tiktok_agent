package com.example.security.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminResponse {
    private Integer id;
    private Long userId;
    private String email;        // optional convenience
    private String favoriteColor;
    private Integer luckyNumber;
    private Boolean isSuperAdmin;
    private String notes;
}
