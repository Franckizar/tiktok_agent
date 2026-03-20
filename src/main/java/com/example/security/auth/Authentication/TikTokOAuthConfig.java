package com.example.security.auth.Authentication;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "tiktok")
@Data
public class TikTokOAuthConfig {
    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String authorizationUrl;
    private String tokenUrl;
    private String userInfoUrl;
}
