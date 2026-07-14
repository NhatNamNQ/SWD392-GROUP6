package swd392.project.orbitdocsbackend.document.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import swd392.project.orbitdocsbackend.document.dto.response.DocumentChunkResponse;

import java.util.UUID;

public interface IDocumentChunkService {
    /**
     * Returns a paginated list of chunks for the given document, ordered by chunk index.
     */
    Page<DocumentChunkResponse> getChunksByDocumentId(UUID documentId, Pageable pageable);

    /**
     * Returns the detail of a single chunk by its UUID.
     */
    DocumentChunkResponse getChunkById(UUID chunkId);
}
