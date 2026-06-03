package swd392.project.orbitdocsbackend.document.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import swd392.project.orbitdocsbackend.document.dto.request.ChapterSyncRequest;
import swd392.project.orbitdocsbackend.document.dto.request.RagFailureRequest;
import swd392.project.orbitdocsbackend.document.service.IChapterService;
import swd392.project.orbitdocsbackend.document.service.IRagIntegrationService;
import swd392.project.orbitdocsbackend.shared.response.ApiResponse;

@RestController
@RequestMapping("/api/internal/rag")
@RequiredArgsConstructor
public class RagWebhookController {

    private final IChapterService chapterService;
    private final IRagIntegrationService ragIntegrationService;

    /**
     * Webhook for Python RAG service to sync extracted chapters back to Java.
     */
    @PostMapping("/chapters/sync")
    public ApiResponse<Void> syncChapters(@Valid @RequestBody ChapterSyncRequest request) {
        chapterService.syncChaptersFromRag(request);
        return ApiResponse.success(null, "Chapters synced successfully");
    }

    @PostMapping("/failed")
    public ApiResponse<Void> handleFailure(@Valid @RequestBody RagFailureRequest request) {
        ragIntegrationService.handleIndexingFailure(request);
        return ApiResponse.success(null, "Failure recorded successfully");
    }
}
