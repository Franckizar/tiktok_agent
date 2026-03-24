package com.example.security.analytics.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AnalyticsSnapshotDTO {
    private Long id;
    private String tiktokVideoId;
    private String coverImageUrl;
    private String captionSnippet;
    private Integer durationSeconds;
    private Long views;
    private Long likes;
    private Long comments;
    private Long shares;
    private Float engagementRate;
    private LocalDateTime snapshotAt;
}