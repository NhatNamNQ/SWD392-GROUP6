package swd392.project.orbitdocsbackend.document.repository;

import swd392.project.orbitdocsbackend.document.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByCourseId(UUID courseId);
    Optional<Document> findByOriginalFilenameAndCourseId(String originalFilename, UUID courseId);
}

