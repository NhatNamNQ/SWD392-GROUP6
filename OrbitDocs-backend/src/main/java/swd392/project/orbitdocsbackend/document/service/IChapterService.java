package swd392.project.orbitdocsbackend.document.service;

import swd392.project.orbitdocsbackend.document.dto.request.ChapterSyncRequest;
import swd392.project.orbitdocsbackend.document.dto.response.ChapterResponse;

import java.util.List;
import java.util.UUID;

public interface IChapterService {
    List<ChapterResponse> getChaptersByDocumentId(UUID documentId);
    void syncChaptersFromRag(ChapterSyncRequest request);
}
