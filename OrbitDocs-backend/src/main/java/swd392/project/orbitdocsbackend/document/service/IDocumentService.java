package swd392.project.orbitdocsbackend.document.service;

import org.springframework.core.io.Resource;
import swd392.project.orbitdocsbackend.document.dto.request.DocumentUploadRequest;
import swd392.project.orbitdocsbackend.document.dto.response.DocumentResponse;
import swd392.project.orbitdocsbackend.document.entity.Document;

import java.util.List;
import java.util.UUID;

public interface IDocumentService {
    DocumentResponse uploadDocument(DocumentUploadRequest request);
    List<DocumentResponse> getDocumentsByCourseId(UUID courseId);
    DocumentResponse getDocumentById(UUID id);
    void deleteDocument(UUID id);
    Document getDocumentEntityById(UUID id);
    Resource getDocumentFile(UUID id);
}
