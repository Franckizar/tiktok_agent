// package com.example.security.dto.response;

// // package com.example.security.dto.response;

// import lombok.AllArgsConstructor;
// import lombok.Builder;
// import lombok.Data;
// import lombok.NoArgsConstructor;

// import java.util.List;

// @Data
// @Builder
// @NoArgsConstructor
// @AllArgsConstructor
// public class PageResponse<T> {
//     private List<T> content;
//     private int page;
//     private int size;
//     private long totalElements;
//     private int totalPages;
//     private boolean first;
//     private boolean last;
//     private boolean empty;
    
//     // Helper method to create from Spring Page
//     public static <T> PageResponse<T> of(org.springframework.data.domain.Page<T> page) {
//         return PageResponse.<T>builder()
//                 .content(page.getContent())
//                 .page(page.getNumber())
//                 .size(page.getSize())
//                 .totalElements(page.getTotalElements())
//                 .totalPages(page.getTotalPages())
//                 .first(page.isFirst())
//                 .last(page.isLast())
//                 .empty(page.isEmpty())
//                 .build();
//     }
// }

// com.example.security.dto.response/PageResponse.java
package com.example.security.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;
}
