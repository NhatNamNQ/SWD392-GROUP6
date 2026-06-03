package swd392.project.orbitdocsbackend.document.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import swd392.project.orbitdocsbackend.document.entity.Document;
import swd392.project.orbitdocsbackend.document.entity.IndexingJob;
import swd392.project.orbitdocsbackend.document.repository.DocumentRepository;
import swd392.project.orbitdocsbackend.document.repository.IndexingJobRepository;
import swd392.project.orbitdocsbackend.shared.enums.DocumentStatus;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class RagApiClient {

    private final RestTemplate restTemplate;
    private final DocumentRepository documentRepository;
    private final IndexingJobRepository indexingJobRepository;

    @Value("${rag.internal-url:http://localhost:8000}/api/index")
    private String pythonRagUrl;

    @Async
    public void sendIndexingRequestAsync(UUID documentId, UUID jobId, String storagePath) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("documentId", documentId.toString());
            request.put("jobId", jobId.toString());
            request.put("storagePath", storagePath);

            log.info("Triggering RAG indexing for document: {}", documentId);
            restTemplate.postForObject(pythonRagUrl, request, String.class);
            log.info("Successfully sent request to RAG service for document: {}", documentId);
        } catch (Exception e) {
            log.error("Failed to trigger RAG indexing for document: {}", documentId, e);

            // Mark the job and document as FAILED so the user sees the error
            try {
                indexingJobRepository.findById(jobId).ifPresent(job -> {
                    job.setStatus(DocumentStatus.FAILED);
                    job.setErrorMessage("Failed to connect to RAG service: " + e.getMessage());
                    job.setCompletedAt(Instant.now());
                    indexingJobRepository.save(job);
                });

                documentRepository.findById(documentId).ifPresent(doc -> {
                    doc.markFailed("RAG service unavailable: " + e.getMessage());
                    documentRepository.save(doc);
                });
            } catch (Exception dbError) {
                log.error("Failed to update failure status in database", dbError);
            }
        }
    }
}
