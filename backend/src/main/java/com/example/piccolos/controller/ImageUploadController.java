package com.example.piccolos.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class ImageUploadController {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

    private final Path uploadDir;

    // Default: the frontend's public/food-images folder, next to the backend folder
    public ImageUploadController(
            @Value("${app.upload-dir:../frontend/public/food-images}") String dir) {
        this.uploadDir = Paths.get(dir).toAbsolutePath().normalize();
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file selected");
        }

        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        int dot = original.lastIndexOf('.');
        String extension = dot >= 0 ? original.substring(dot + 1).toLowerCase() : "";

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            return ResponseEntity.badRequest().body("Only JPG, PNG or WEBP images are allowed");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body("The file is not an image");
        }

        // Build a safe filename ourselves; never trust the uploaded name as a path
        String baseName = (dot > 0 ? original.substring(0, dot) : "image")
                .toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        if (baseName.isEmpty()) baseName = "image";
        String fileName = baseName + "-" + UUID.randomUUID().toString().substring(0, 6) + "." + extension;

        try {
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("Saved uploaded image to: " + target);

            return ResponseEntity.ok(Map.of("imageUrl", "/food-images/" + fileName));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Could not save the image");
        }
    }
}
