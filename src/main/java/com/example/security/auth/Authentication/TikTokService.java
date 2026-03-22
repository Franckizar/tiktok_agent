package com.example.security.auth.Authentication;

import com.example.security.UserRepository;
import com.example.security.Users.Role;
import com.example.security.Users.User;
import com.example.security.Users.UserStatus;
import com.example.security.Users.Player.PlayerService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class TikTokService {

    private final UserRepository userRepository;
    private final PlayerService playerService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, String> pkceStorage = new ConcurrentHashMap<>();

    @Value("${tiktok.redirect-uri:https://modest-integral-ibex.ngrok-free.app/api/v1/auth/tiktok/callback}")
    private String redirectUri;

    @Value("${tiktok.client-id:sbawcpylm5rplz9cos}")
    private String clientId;

    @Value("${tiktok.client-secret:YOUR_CLIENT_SECRET}")
    private String clientSecret;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private static final String AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
    private static final String TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
    private static final String USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/";

    // ========================================
    // GENERATE TIKTOK AUTH URL
    // ========================================
    public String getTikTokAuthUrl() {
        log.info("🚀 Generating TikTok OAuth URL | Redirect URI: {}", redirectUri);

        try {
            String state = UUID.randomUUID().toString();
            String codeVerifier = generateCodeVerifier();
            String codeChallenge = generateCodeChallenge(codeVerifier);

            pkceStorage.put(state, codeVerifier);
            log.debug("✅ PKCE stored - state: {}, verifier length: {}", state, codeVerifier.length());

            String authUrl = UriComponentsBuilder.fromUriString(AUTH_URL)
                    .queryParam("client_key", clientId)
                    .queryParam("scope", "user.info.basic,user.info.profile,user.info.stats,video.list")
                    .queryParam("response_type", "code")
                    .queryParam("redirect_uri", redirectUri)
                    .queryParam("state", state)
                    .queryParam("code_challenge", codeChallenge)
                    .queryParam("code_challenge_method", "S256")
                    .build()
                    .toUriString();

            log.info("✅ TikTok auth URL generated | Callback: {}", redirectUri);
            return authUrl;

        } catch (Exception e) {
            log.error("❌ Error generating TikTok auth URL", e);
            throw new RuntimeException("Failed to generate authentication URL", e);
        }
    }

    // ========================================
    // HANDLE TIKTOK CALLBACK
    // ========================================
    public User handleTikTokCallback(String code, String state) {
        log.info("🎉 TIKTOK CALLBACK RECEIVED! code: {}, state: {}", code, state);

        if (state == null || !pkceStorage.containsKey(state)) {
            log.error("❌ Invalid/missing state: {}", state);
            throw new RuntimeException("Invalid state parameter");
        }

        String codeVerifier = pkceStorage.remove(state);
        log.info("✅ Valid state & PKCE verifier retrieved");

        try {
            // 1. Exchange code for tokens
            TokenResponse tokenResponse = exchangeCodeForToken(code, codeVerifier);
            log.info("✅ Access token obtained: {}...",
                    tokenResponse.accessToken().substring(0, 20));

            // 2. Get user info from TikTok
            JsonNode userInfo = getTikTokUserInfo(tokenResponse.accessToken());
            log.info("✅ User info fetched: open_id={}, display_name={}",
                    userInfo.get("open_id").asText(),
                    userInfo.has("display_name") ? userInfo.get("display_name").asText() : "N/A");

            // 3. Create or update user in DB
            User user = createOrUpdateTikTokUser(userInfo, tokenResponse);
            log.info("🎉 TikTok login SUCCESS: UserID={}", user.getId());

            return user;

        } catch (Exception e) {
            log.error("💥 TikTok callback failed", e);
            throw new RuntimeException("TikTok authentication failed", e);
        }
    }

    // ========================================
    // EXCHANGE CODE FOR TOKEN
    // ========================================
    private TokenResponse exchangeCodeForToken(String code, String codeVerifier) {
        log.info("🔄 Exchanging code for tokens...");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_key", clientId);
            body.add("client_secret", clientSecret);
            body.add("code", code);
            body.add("grant_type", "authorization_code");
            body.add("redirect_uri", redirectUri);
            body.add("code_verifier", codeVerifier);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    TOKEN_URL, HttpMethod.POST, request, String.class);

            log.info("📡 Token response status: {}", response.getStatusCode());

            JsonNode json = objectMapper.readTree(response.getBody());
            if (json.has("error")) {
                throw new RuntimeException("Token error: " +
                        json.get("error_description").asText());
            }

            return new TokenResponse(
                    json.get("access_token").asText(),
                    json.get("refresh_token").asText(),
                    json.get("expires_in").asLong()
            );

        } catch (Exception e) {
            log.error("❌ Failed to exchange code for token", e);
            throw new RuntimeException("Token exchange failed: " + e.getMessage(), e);
        }
    }

    // ========================================
    // GET TIKTOK USER INFO
    // ========================================
    private JsonNode getTikTokUserInfo(String accessToken) {
        log.info("👤 Fetching TikTok user info...");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);

            String url = UriComponentsBuilder.fromUriString(USER_INFO_URL)
                    .queryParam("fields", "open_id,union_id,avatar_url,display_name,bio_description,profile_web_link,is_verified,follower_count,following_count,likes_count,video_count")
                    .build()
                    .toUriString();

            HttpEntity<String> request = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, request, String.class);

            log.info("📡 TikTok User Info Response: {}", response.getBody());

            JsonNode json = objectMapper.readTree(response.getBody());

            if (json.has("error") && json.get("error").has("code")) {
                String errorCode = json.get("error").get("code").asText();
                if (!"ok".equalsIgnoreCase(errorCode)) {
                    String errorMsg = json.get("error").has("message") ?
                            json.get("error").get("message").asText() : errorCode;
                    log.error("❌ TikTok API Error: {}", errorMsg);
                    throw new RuntimeException("User info error: " + errorMsg);
                }
            }

            return json.get("data").get("user");

        } catch (Exception e) {
            log.error("❌ Failed to fetch user info", e);
            throw new RuntimeException("User info fetch failed: " + e.getMessage(), e);
        }
    }

    // ========================================
    // CREATE OR UPDATE TIKTOK USER
 private User createOrUpdateTikTokUser(JsonNode userInfo, TokenResponse tokenResponse) {
    String tiktokId = userInfo.get("open_id").asText();

    String displayName = userInfo.has("display_name") ?
            userInfo.get("display_name").asText() : null;

    String avatarUrl = userInfo.has("avatar_url") ?
            userInfo.get("avatar_url").asText() : null;

    String unionId = userInfo.has("union_id") ?
            userInfo.get("union_id").asText() : null;

    String bio = userInfo.has("bio_description") ?
            userInfo.get("bio_description").asText() : null;

    String profileLink = userInfo.has("profile_web_link") ?
            userInfo.get("profile_web_link").asText() : null;

    boolean isVerified = userInfo.has("is_verified") &&
            userInfo.get("is_verified").asBoolean();

    Long followerCount = userInfo.has("follower_count") ?
            userInfo.get("follower_count").asLong() : 0L;

    Long followingCount = userInfo.has("following_count") ?
            userInfo.get("following_count").asLong() : 0L;

    Long likesCount = userInfo.has("likes_count") ?
            userInfo.get("likes_count").asLong() : 0L;

    Long videoCount = userInfo.has("video_count") ?
            userInfo.get("video_count").asLong() : 0L;

    String placeholderEmail = "tiktok_" + tiktokId + "@tiktok.placeholder";

    Optional<User> existing = userRepository.findByTiktokId(tiktokId);

    User user;
    if (existing.isPresent()) {
        // ========================================
        // UPDATE existing user
        // ========================================
        user = existing.get();
        user.setTiktokId(tiktokId);
        user.setTiktokAccessToken(tokenResponse.accessToken());
        user.setTiktokRefreshToken(tokenResponse.refreshToken());
        user.setTiktokConnected(true);
        user.setTiktokTokenExpiry(LocalDateTime.now().plusSeconds(tokenResponse.expiresIn()));
        user.setDisplayName(displayName);
        user.setAvatarUrl(avatarUrl);
        user.setUnionId(unionId);
        user.setTiktokBio(bio);
        user.setTiktokProfileLink(profileLink);
        user.setTiktokVerified(isVerified);
        user.setTiktokFollowerCount(followerCount);
        user.setTiktokFollowingCount(followingCount);
        user.setTiktokLikesCount(likesCount);
        user.setTiktokVideoCount(videoCount);
        log.info("🔄 Existing TikTok user updated: {} | followers: {}",
                displayName, followerCount);

        return userRepository.save(user);

    } else {
        // ========================================
        // CREATE new user
        // ========================================
        user = User.builder()
                .firstname(displayName != null ? displayName : "tiktok_" + tiktokId.substring(0, 8))
                .lastname("")
                .email(placeholderEmail)
                .tiktokId(tiktokId)
                .tiktokAccessToken(tokenResponse.accessToken())
                .tiktokRefreshToken(tokenResponse.refreshToken())
                .tiktokConnected(true)
                .tiktokTokenExpiry(LocalDateTime.now().plusSeconds(tokenResponse.expiresIn()))
                .displayName(displayName)
                .avatarUrl(avatarUrl)
                .unionId(unionId)
                .status(UserStatus.ACTIVE)
                .defaultRole(Role.PLAYER)
                .tokenVersion(0)
                .build();

        // Set stats after build — cannot go inside builder
        user.setTiktokBio(bio);
        user.setTiktokProfileLink(profileLink);
        user.setTiktokVerified(isVerified);
        user.setTiktokFollowerCount(followerCount);
        user.setTiktokFollowingCount(followingCount);
        user.setTiktokLikesCount(likesCount);
        user.setTiktokVideoCount(videoCount);

        user.addRole(Role.PLAYER);

        // Save user first to get ID
        User savedUser = userRepository.save(user);

        // Create player profile
        playerService.create(savedUser.getId(), null);
        log.info("🆕 New TikTok user created: {} | followers: {} | player profile created ✅",
                displayName, followerCount);

        return savedUser;
    }
}

// ========================================
// PKCE HELPERS
// ========================================
private String generateCodeVerifier() {
    byte[] randomBytes = new byte[32];
    new SecureRandom().nextBytes(randomBytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
}

private String generateCodeChallenge(String codeVerifier) {
    try {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hashed = digest.digest(codeVerifier.getBytes(StandardCharsets.US_ASCII));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(hashed);
    } catch (Exception e) {
        throw new RuntimeException("SHA-256 failed", e);
    }
}

// ========================================
// TOKEN RESPONSE RECORD
// ========================================
record TokenResponse(String accessToken, String refreshToken, long expiresIn) {}}