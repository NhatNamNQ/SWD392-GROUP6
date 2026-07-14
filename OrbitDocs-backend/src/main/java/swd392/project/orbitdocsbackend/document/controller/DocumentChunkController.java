package swd392.project.orbitdocsbackend.document.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swd392.project.orbitdocsbackend.document.dto.response.DocumentChunkResponse;
import swd392.project.orbitdocsbackend.document.entity.Document;
import swd392.project.orbitdocsbackend.document.service.IDocumentChunkService;
import swd392.project.orbitdocsbackend.document.service.IDocumentService;
import swd392.project.orbitdocsbackend.shared.response.ApiResponse;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentChunkController {

    private final IDocumentChunkService documentChunkService;
    private final IDocumentService documentService;

    @Value("${app.storage.upload-dir:uploads/documents}")
    private String uploadDir;

    /**
     * GET /api/documents/{documentId}/chunks?page=0&size=20
     * Returns a paginated list of chunks for the given document.
     */
    @GetMapping("/{documentId}/chunks")
    public ApiResponse<Page<DocumentChunkResponse>> getChunksByDocumentId(
            @PathVariable UUID documentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        return ApiResponse.success(documentChunkService.getChunksByDocumentId(documentId, pageable));
    }

    /**
     * GET /api/documents/chunks/{chunkId}
     * Returns the detail of a single chunk.
     */
    @GetMapping("/chunks/{chunkId}")
    public ApiResponse<DocumentChunkResponse> getChunkById(@PathVariable UUID chunkId) {
        return ApiResponse.success(documentChunkService.getChunkById(chunkId));
    }

    /**
     * GET /api/documents/{documentId}/file
     * Streams the original PDF file so the frontend PDF viewer can render it.
     */
    @GetMapping("/{documentId}/file")
    public ResponseEntity<Resource> getDocumentFile(@PathVariable UUID documentId) {
        try {
            Document document = documentService.getDocumentEntityById(documentId);
            Resource resource = documentService.getDocumentFile(documentId);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + document.getOriginalFilename() + "\"")
                    .body(resource);

        } catch (Exception ex) {
            log.error("Failed to serve PDF file for document {}: {}", documentId, ex.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
