// package com.example.security.service;

// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Service;
// import java.nio.file.Files;
// import java.nio.file.Paths;
// import java.util.Base64;
// import java.util.UUID;

// @Service
// public class FileStorageService {

// @Value("${file.upload-dir:uploads}")
// private String uploadDir;

// public String saveBase64Image(String base64Image, Long userId) {
// try {
// // Create user directory
// String userDir = uploadDir + "/users/" + userId;
// Files.createDirectories(Paths.get(userDir));

// // Extract base64 data
// String base64Data = base64Image.split(",")[1];
// byte[] imageBytes = Base64.getDecoder().decode(base64Data);

// // Save file
// String fileName = "logo_" + UUID.randomUUID() + ".png";
// String filePath = userDir + "/" + fileName;
// Files.write(Paths.get(filePath), imageBytes);

// return "/uploads/users/" + userId + "/" + fileName;

// } catch (Exception e) {
// e.printStackTrace();
// return null;
// }
// }
// }