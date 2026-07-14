package swd392.project.orbitdocsbackend.document.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import swd392.project.orbitdocsbackend.document.dto.response.DocumentChunkResponse;
import swd392.project.orbitdocsbackend.document.mapper.DocumentChunkMapper;
import swd392.project.orbitdocsbackend.document.repository.DocumentChunkRepository;
import swd392.project.orbitdocsbackend.document.repository.DocumentRepository;
import swd392.project.orbitdocsbackend.document.service.IDocumentChunkService;
import swd392.project.orbitdocsbackend.shared.exception.AppException;
import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentChunkServiceImpl implements IDocumentChunkService {

    private final DocumentChunkRepository documentChunkRepository;
    private final DocumentRepository documentRepository;
    private final DocumentChunkMapper documentChunkMapper;

    @Override
    public Page<DocumentChunkResponse> getChunksByDocumentId(UUID documentId, Pageable pageable) {
        // Verify the document exists
        documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));

        return documentChunkRepository
                .findByDocumentIdOrderByChunkIndexAsc(documentId, pageable)
                .map(documentChunkMapper::toResponse);
    }

    @Override
    public DocumentChunkResponse getChunkById(UUID chunkId) {
        return documentChunkMapper.toResponse(
                documentChunkRepository.findById(chunkId)
                        .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND))
        );
    }
}
