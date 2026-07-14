package swd392.project.orbitdocsbackend.document.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import swd392.project.orbitdocsbackend.document.dto.response.DocumentChunkResponse;
import swd392.project.orbitdocsbackend.document.service.IDocumentChunkService;
import swd392.project.orbitdocsbackend.shared.response.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentChunkController {

    private final IDocumentChunkService documentChunkService;

    @GetMapping("/{documentId}/chunks")
    public ApiResponse<List<DocumentChunkResponse>> getChunksByDocumentId(@PathVariable UUID documentId) {
        return ApiResponse.success(documentChunkService.getChunksByDocumentId(documentId));
    }
}
