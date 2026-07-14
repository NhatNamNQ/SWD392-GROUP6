package swd392.project.orbitdocsbackend.document.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface IStorageService {
    String uploadFile(MultipartFile file) throws IOException;
    void deleteFile(String storagePath) throws IOException;
    Resource loadFileAsResource(String storagePath) throws IOException;
}
