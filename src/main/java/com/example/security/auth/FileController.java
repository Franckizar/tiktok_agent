// package com.example.security.auth;

// import org.springframework.core.io.Resource;
// import org.springframework.core.io.UrlResource;
// import org.springframework.http.HttpHeaders;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.nio.file.Path;
// import java.nio.file.Paths;

// @RestController
// @RequestMapping("/uploads")
// public class FileController {

//     @GetMapping("/users/{userId}/{filename}")
//     public ResponseEntity<Resource> serveFile(
//             @PathVariable Long userId,
//             @PathVariable String filename) {
        
//         try {
//             Path filePath = Paths.get("uploads/users/" + userId + "/" + filename);
//             Resource resource = new UrlResource(filePath.toUri());
            
//             if (resource.exists()) {
//                 return ResponseEntity.ok()
//                         .header(HttpHeaders.CONTENT_DISPOSITION, 
//                                "inline; filename=\"" + resource.getFilename() + "\"")
//                         .body(resource);
//             } else {
//                 return ResponseEntity.notFound().build();
//             }
//         } catch (Exception e) {
//             return ResponseEntity.notFound().build();
//         }
//     }
// }