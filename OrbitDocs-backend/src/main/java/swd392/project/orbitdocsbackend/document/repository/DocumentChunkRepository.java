package swd392.project.orbitdocsbackend.document.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import swd392.project.orbitdocsbackend.document.entity.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, UUID> {
    List<DocumentChunk> findByDocumentId(UUID documentId);

    Page<DocumentChunk> findByDocumentIdOrderByChunkIndexAsc(UUID documentId, Pageable pageable);
}

