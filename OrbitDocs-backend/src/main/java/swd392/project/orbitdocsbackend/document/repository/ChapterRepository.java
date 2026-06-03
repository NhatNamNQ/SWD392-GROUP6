package swd392.project.orbitdocsbackend.document.repository;

import swd392.project.orbitdocsbackend.document.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, UUID> {
    List<Chapter> findByDocumentId(UUID documentId);

    @Modifying
    @Query("DELETE FROM Chapter c WHERE c.document.id = :documentId")
    void deleteByDocumentId(UUID documentId);
}
