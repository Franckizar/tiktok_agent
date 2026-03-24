package com.example.security.scheduling.dto;

import com.example.security.scheduling.ScheduledPost;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ScheduledPostDTO {
    private Long id;
    private String title;
    private String caption;
    private String hashtags;
    private ScheduledPost.PrivacyLevel privacyLevel;
    private LocalDateTime scheduledAt;
    private ScheduledPost.PostStatus status;
    private String tiktokPublishId;
    private String failureReason;
    private int retryCount;
    private LocalDateTime createdAt;
}