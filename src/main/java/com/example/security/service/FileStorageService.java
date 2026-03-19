package com.example.security.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public String saveBase64Image(String base64Image, Long userId) {
        try {
            String userDir = uploadDir + "/users/" + userId;
            Files.createDirectories(Paths.get(userDir));

            if (!base64Image.contains(",")) {
                log.warn("Invalid base64 image format for user: {}", userId);
                return null;
            }

            String base64Data = base64Image.split(",")[1];
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);
            String fileName = "logo_" + UUID.randomUUID().toString() + ".png";
            String filePath = userDir + "/" + fileName;

            Files.write(Paths.get(filePath), imageBytes);
            log.info("✅ Image saved for user {} at: {}", userId, filePath);

            return "/uploads/users/" + userId + "/" + fileName;

        } catch (Exception e) {
            log.error("Failed to save image for user: {}", userId, e);
            return null;
        }
    }
}