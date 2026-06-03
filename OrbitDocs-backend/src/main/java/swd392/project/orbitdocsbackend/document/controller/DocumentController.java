package swd392.project.orbitdocsbackend.document.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import swd392.project.orbitdocsbackend.document.dto.request.DocumentUploadRequest;
import swd392.project.orbitdocsbackend.document.dto.response.DocumentResponse;
import swd392.project.orbitdocsbackend.document.service.IDocumentService;
import swd392.project.orbitdocsbackend.shared.response.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final IDocumentService documentService;

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<DocumentResponse> uploadDocument(@Valid @ModelAttribute DocumentUploadRequest request) {
        DocumentResponse response = documentService.uploadDocument(request);
        return ApiResponse.success(response, "Document uploaded and indexing triggered successfully");
    }

    @GetMapping("/course/{courseId}")
    public ApiResponse<List<DocumentResponse>> getDocumentsByCourseId(@PathVariable UUID courseId) {
        return ApiResponse.success(documentService.getDocumentsByCourseId(courseId));
    }

    @GetMapping("/{id}")
    public ApiResponse<DocumentResponse> getDocumentById(@PathVariable UUID id) {
        return ApiResponse.success(documentService.getDocumentById(id));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteDocument(@PathVariable UUID id) {
        documentService.deleteDocument(id);
        return ApiResponse.success(null, "Document deleted successfully");
    }
}
