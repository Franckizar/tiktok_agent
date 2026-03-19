package com.example.security.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SuperAdminRequest {

    @NotBlank(message = "System name is required")
    private String systemName;

    @NotBlank(message = "Contact email is required")
    @Email(message = "Invalid contact email")
    private String contactEmail;

    private String contactPhone;
}