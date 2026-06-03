package swd392.project.orbitdocsbackend.document.service;

import swd392.project.orbitdocsbackend.document.dto.request.DocumentUploadRequest;
import swd392.project.orbitdocsbackend.document.dto.response.DocumentResponse;

import java.util.List;
import java.util.UUID;

public interface IDocumentService {
    DocumentResponse uploadDocument(DocumentUploadRequest request);
    List<DocumentResponse> getDocumentsByCourseId(UUID courseId);
    DocumentResponse getDocumentById(UUID id);
    void deleteDocument(UUID id);
}
