package swd392.project.orbitdocsbackend.chat.entity;

import jakarta.persistence.*;
import lombok.*;
import swd392.project.orbitdocsbackend.document.entity.Document;
import swd392.project.orbitdocsbackend.rag.entity.DocumentChunk;

import java.util.UUID;

/**
 * A citation linking an ASSISTANT {@link ChatMessage} to the specific
 * {@link DocumentChunk} retrieved from the vector store.
 *
 * <p>Citations are created by Java backend after receiving the RAG response
 * from Python, so the student can see which document/chapter the answer came from.</p>
 *
 * <p>Module: chat</p>
 */
@Entity
@Table(name = "message_citations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageCitation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "message_id", nullable = false)
    private ChatMessage message;

    /**
     * The exact chunk retrieved by the vector search.
     * Nullable — if the chunk is deleted later, the citation still survives.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chunk_id")
    private DocumentChunk chunk;

    /**
     * The parent document of the cited chunk (denormalised for fast display).
     * Nullable for the same tombstone-safety reason as chunk.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private Document document;

    /**
     * Cosine similarity score returned by pgvector (0.0–1.0).
     * Higher is more relevant.
     */
    @Column(name = "similarity_score")
    private Float similarityScore;

    /**
     * Short text excerpt from the chunk shown in the citation UI.
     * Typically the first 300 chars of the chunk content.
     */
    @Column(name = "excerpt", columnDefinition = "TEXT")
    private String excerpt;
}
