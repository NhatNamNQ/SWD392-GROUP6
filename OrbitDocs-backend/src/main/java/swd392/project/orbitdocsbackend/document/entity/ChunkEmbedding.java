package swd392.project.orbitdocsbackend.document.entity;

import jakarta.persistence.*;
import lombok.*;
import com.pgvector.PGvector;

import java.time.Instant;

@Entity
@Table(name = "chunk_embeddings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChunkEmbedding {

    /**
     * Same UUID as the parent DocumentChunk — shared primary key (1-to-1).
     */
    @Id
    @Column(name = "chunk_id", updatable = false, nullable = false)
    private java.util.UUID chunkId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "chunk_id")
    private DocumentChunk chunk;

    @Column(name = "embedding", columnDefinition = "vector(1024)")
    private PGvector embedding;

    /** Name of the embedding model that produced this vector. */
    @Column(name = "model_name", nullable = false, length = 100)
    private String modelName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
