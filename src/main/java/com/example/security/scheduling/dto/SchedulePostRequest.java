package com.example.security.scheduling.dto;

import com.example.security.scheduling.ScheduledPost;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SchedulePostRequest {
    private String title;
    private String caption;
    private String hashtags;
    private String videoFilePath;
    private ScheduledPost.PrivacyLevel privacyLevel;
    private LocalDateTime scheduledAt;
}