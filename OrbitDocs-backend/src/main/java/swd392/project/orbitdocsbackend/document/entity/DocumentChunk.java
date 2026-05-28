package swd392.project.orbitdocsbackend.document.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * A text chunk extracted from a {@link Document} by the Python RAG service.
 *
 * <p><strong>Ownership:</strong> Python RAG <em>writes</em> these rows.
 * Java backend only <em>reads</em> them (via citations) and queries chunk counts.
 * Never write to this table from Java code.</p>
 *
 * <p>Module: rag</p>
 */
@Entity
@Table(name = "document_chunks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    /** Zero-based position of this chunk within the source document. */
    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    /** Approximate token count; used for monitoring chunk size distribution. */
    @Column(name = "token_count")
    private Integer tokenCount;

    /**
     * Extra metadata stored by Python RAG as JSON:
     * e.g. {@code {"page": 5, "section": "Introduction"}}.
     * Stored as JSONB in PostgreSQL.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // ─────────── Relationship ───────────

    /** One-to-one with the vector embedding generated for this chunk. */
    @OneToOne(mappedBy = "chunk", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private ChunkEmbedding embedding;
}
