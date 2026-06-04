package swd392.project.orbitdocsbackend.document.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import swd392.project.orbitdocsbackend.document.service.IStorageService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class LocalStorageServiceImpl implements IStorageService {

    private final Path fileStorageLocation;
    private final String uploadDir;

    public LocalStorageServiceImpl(@Value("${app.storage.upload-dir:uploads/documents}") String uploadDir) {
        this.uploadDir = uploadDir;
        
        Path baseDir = Paths.get("").toAbsolutePath();
        // Failsafe: If running from the root project directory (e.g. IntelliJ default), append the backend module folder
        if (!baseDir.endsWith("OrbitDocs-backend") && Files.exists(baseDir.resolve("OrbitDocs-backend"))) {
            baseDir = baseDir.resolve("OrbitDocs-backend");
        }
        
        this.fileStorageLocation = baseDir.resolve(uploadDir).normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Override
    public String uploadFile(MultipartFile file) throws IOException {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf");
        
        // Generate a unique file name to prevent overwriting and path traversal
        String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;
        
        Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Return relative path (e.g. "uploads/documents/uuid_file.pdf") for portability
        return Paths.get(uploadDir, uniqueFileName).toString();
    }

    @Override
    public void deleteFile(String storagePath) throws IOException {
        if (storagePath == null || storagePath.trim().isEmpty()) {
            return;
        }
        Path baseDir = Paths.get("").toAbsolutePath();
        if (!baseDir.endsWith("OrbitDocs-backend") && Files.exists(baseDir.resolve("OrbitDocs-backend"))) {
            baseDir = baseDir.resolve("OrbitDocs-backend");
        }

        Path targetLocation = Paths.get(storagePath);
        if (!targetLocation.isAbsolute()) {
            targetLocation = baseDir.resolve(storagePath).normalize();
        }
        Files.deleteIfExists(targetLocation);
    }
}
