package swd392.project.orbitdocsbackend.document.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swd392.project.orbitdocsbackend.document.dto.request.RagFailureRequest;
import swd392.project.orbitdocsbackend.document.entity.Document;
import swd392.project.orbitdocsbackend.document.entity.IndexingJob;
import swd392.project.orbitdocsbackend.document.repository.DocumentRepository;
import swd392.project.orbitdocsbackend.document.repository.IndexingJobRepository;
import swd392.project.orbitdocsbackend.document.service.IRagIntegrationService;
import swd392.project.orbitdocsbackend.shared.enums.DocumentStatus;
import swd392.project.orbitdocsbackend.shared.exception.AppException;
import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RagIntegrationServiceImpl implements IRagIntegrationService {

    private final IndexingJobRepository indexingJobRepository;
    private final DocumentRepository documentRepository;
    private final RagApiClient ragApiClient;

    @Override
    @Transactional
    public void triggerIndexing(UUID documentId, String storagePath) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));

        // Use COUNT query instead of loading all jobs to avoid N+1
        long jobCount = indexingJobRepository.countByDocumentId(documentId);
        Short attemptNumber = (short) (jobCount + 1);

        IndexingJob job = IndexingJob.builder()
                .document(document)
                .status(DocumentStatus.PROCESSING)
                .attemptNumber(attemptNumber)
                .startedAt(Instant.now())
                .build();

        indexingJobRepository.save(job);

        // Update document status
        document.markProcessing();
        documentRepository.save(document);

        // Async call to Python RAG using @Async
        ragApiClient.sendIndexingRequestAsync(documentId, job.getId(), storagePath);
    }

    @Override
    @Transactional
    public void handleIndexingFailure(RagFailureRequest request) {
        Document document = documentRepository.findById(request.getDocumentId())
                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));

        IndexingJob job = indexingJobRepository.findById(request.getJobId())
                .orElseThrow(() -> new AppException(ErrorCode.INDEXING_JOB_NOT_FOUND));

        if (job.getStatus() == DocumentStatus.PROCESSING) {
            job.setStatus(DocumentStatus.FAILED);
            job.setCompletedAt(Instant.now());
            indexingJobRepository.save(job);
        }

        document.markFailed(request.getError());
        documentRepository.save(document);
        log.warn("Recorded indexing failure for document {}.", document.getId());
    }
}
