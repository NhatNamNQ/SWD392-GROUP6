package swd392.project.orbitdocsbackend.document.entity;

import jakarta.persistence.*;
import lombok.*;
import swd392.project.orbitdocsbackend.shared.enums.DocumentStatus;
import java.time.Instant;
import java.util.UUID;

/**
 * Records every attempt to index (or re-index) a {@link Document}.
 * Each call to the Python RAG service creates a new job row so the team
 * can audit how many retries occurred and why failures happened.
 */
@Entity
@Table(name = "indexing_jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IndexingJob {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DocumentStatus status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    /** Increments with each re-index attempt on the same document. */
    @Column(name = "attempt_number", nullable = false)
    private Short attemptNumber;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = Instant.now();
        if (this.startedAt == null) {
            this.startedAt = Instant.now();
        }
    }
}
