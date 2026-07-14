package swd392.project.orbitdocsbackend.document.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import swd392.project.orbitdocsbackend.document.dto.response.DocumentChunkResponse;
import swd392.project.orbitdocsbackend.document.mapper.DocumentChunkMapper;
import swd392.project.orbitdocsbackend.document.repository.DocumentChunkRepository;
import swd392.project.orbitdocsbackend.document.repository.DocumentRepository;
import swd392.project.orbitdocsbackend.document.service.IDocumentChunkService;
import swd392.project.orbitdocsbackend.shared.exception.AppException;
import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentChunkServiceImpl implements IDocumentChunkService {

    private final DocumentChunkRepository documentChunkRepository;
    private final DocumentRepository documentRepository;
    private final DocumentChunkMapper documentChunkMapper;

    @Override
    public List<DocumentChunkResponse> getChunksByDocumentId(UUID documentId) {
        documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));

        log.info("Fetching chunks for document: {}", documentId);
        return documentChunkRepository.findByDocumentIdOrderByChunkIndexAsc(documentId)
                .stream()
                .map(documentChunkMapper::toResponse)
                .collect(Collectors.toList());
    }
}
