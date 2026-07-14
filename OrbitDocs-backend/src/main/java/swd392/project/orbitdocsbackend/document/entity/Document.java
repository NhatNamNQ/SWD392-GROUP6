package swd392.project.orbitdocsbackend.document.entity;

import jakarta.persistence.*;
import lombok.*;
import swd392.project.orbitdocsbackend.course.entity.Course;
import swd392.project.orbitdocsbackend.shared.entity.BaseEntity;
import swd392.project.orbitdocsbackend.shared.enums.DocumentStatus;
import swd392.project.orbitdocsbackend.shared.enums.FileType;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents a course document uploaded by a Lecturer.
 * Java backend owns all metadata; Python RAG service owns the
 * chunks/embeddings.
 */
@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    /** Original filename as provided by the uploader. */
    @Column(name = "original_filename", nullable = false, length = 500)
    private String originalFilename;

    /**
     * Path/key used to retrieve the file from the storage backend
     * (local filesystem path or MinIO/S3 object key).
     */
    @Column(name = "storage_path", nullable = false, length = 1000)
    private String storagePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", nullable = false, length = 10)
    private FileType fileType;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private DocumentStatus status = DocumentStatus.UPLOADED;

    /** Human-readable reason populated by Python RAG on indexing failure. */
    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    /** Number of chunks created by Python RAG; null until indexing completes. */
    @Column(name = "chunk_count")
    private Integer chunkCount;

    /** Timestamp when Python RAG last completed indexing successfully. */
    @Column(name = "indexed_at")
    private Instant indexedAt;

    // ─────────── Relationships ───────────

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<Chapter> chapters = new ArrayList<>();

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("attempt_number DESC")
    @Builder.Default
    private List<IndexingJob> indexingJobs = new ArrayList<>();

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DocumentChunk> chunks = new ArrayList<>();

    // ─────────── Business helpers ───────────

    public boolean isIndexable() {
        return status == DocumentStatus.UPLOADED || status == DocumentStatus.FAILED;
    }

    public void markProcessing() {
        this.status = DocumentStatus.PROCESSING;
        this.failureReason = null;
    }

    public void markIndexed(int chunkCount) {
        this.status = DocumentStatus.INDEXED;
        this.chunkCount = chunkCount;
        this.indexedAt = Instant.now();
        this.failureReason = null;
    }

    public void markFailed(String reason) {
        this.status = DocumentStatus.FAILED;
        this.failureReason = reason;
    }
}
