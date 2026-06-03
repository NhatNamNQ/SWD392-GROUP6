package swd392.project.orbitdocsbackend.document.repository;

import swd392.project.orbitdocsbackend.document.entity.IndexingJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.Optional;

@Repository
public interface IndexingJobRepository extends JpaRepository<IndexingJob, UUID> {
    Optional<IndexingJob> findTopByDocumentIdOrderByAttemptNumberDesc(UUID documentId);
    long countByDocumentId(UUID documentId);
}

