package swd392.project.orbitdocsbackend.document.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import swd392.project.orbitdocsbackend.document.dto.response.ChapterResponse;
import swd392.project.orbitdocsbackend.document.service.IChapterService;
import swd392.project.orbitdocsbackend.shared.response.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class ChapterController {

    private final IChapterService chapterService;

    @GetMapping("/{documentId}/chapters")
    public ApiResponse<List<ChapterResponse>> getChaptersByDocumentId(@PathVariable UUID documentId) {
        return ApiResponse.success(chapterService.getChaptersByDocumentId(documentId));
    }
}
