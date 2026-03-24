package com.example.security.scheduling.dto;

import com.example.security.scheduling.PostHistory;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class PostHistoryDTO {
    private Long id;
    private String tiktokVideoId;
    private String caption;
    private String hashtags;
    private LocalDateTime postedAt;
    private Long viewsAtPost;
    private Long likesAtPost;
    private Long commentsAtPost;
    private Long sharesAtPost;
    private PostHistory.PostSource source;
}