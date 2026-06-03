package swd392.project.orbitdocsbackend.document.service;

import java.util.UUID;

import swd392.project.orbitdocsbackend.document.dto.request.RagFailureRequest;

public interface IRagIntegrationService {
    void triggerIndexing(UUID documentId, String storagePath);
    void handleIndexingFailure(RagFailureRequest request);
}
