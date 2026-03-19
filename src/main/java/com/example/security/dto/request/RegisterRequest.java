package com.example.security.dto.request;

import com.example.security.Users.Role;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Firstname is required")
    @Size(min = 2, max = 50, message = "Firstname must be 2-50 characters")
    private String firstname;

    @NotBlank(message = "Lastname is required")
    @Size(min = 2, max = 50, message = "Lastname must be 2-50 characters")
    private String lastname;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be 6-100 characters")
    private String password;

//    @NotNull(message = "Role is required")
    private Role role;

    // 👇 UNCOMMENT THIS LINE
    private String logoImage;

    // Keep all your existing fields
    private String ProfileImageUrl;
    private String favoriteColor;
    private Integer luckyNumber;
    private String fullName;
    private String bio;
    private String resumeUrl;
    private String companyName;
    private String industry;
    private String description;
    private String website;
    private String logoUrl;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private Double latitude;
    private Double longitude;
    private String department;
    private String licenseNumber;
    private String shift;
    private String contactNumber;
    private String professionalEmail;
    private String photoUrl;
    private String officeNumber;
    private Integer yearsOfExperience;
    private String languagesSpoken;
    private Boolean active;
    private String technicianLevel;
    private String certifications;
    private String displayName;
    private String profileImageUrl;
}