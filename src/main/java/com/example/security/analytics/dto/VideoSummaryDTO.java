package com.example.security.analytics.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VideoSummaryDTO {
    private String tiktokVideoId;
    private String coverImageUrl;
    private String captionSnippet;
    private Integer durationSeconds;
    private Long latestViews;
    private Long latestLikes;
    private Long latestComments;
    private Long latestShares;
    private Float latestEngagementRate;
    private Long viewsGrowth;
    private Float growthPercentage;
}