package swd392.project.orbitdocsbackend.document.service;

import swd392.project.orbitdocsbackend.document.dto.response.DocumentChunkResponse;

import java.util.List;
import java.util.UUID;

public interface IDocumentChunkService {
    List<DocumentChunkResponse> getChunksByDocumentId(UUID documentId);
}
