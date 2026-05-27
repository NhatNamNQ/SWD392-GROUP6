package swd392.project.orbitdocsbackend.chat.entity;

import jakarta.persistence.*;
import lombok.*;
import swd392.project.orbitdocsbackend.shared.enums.MessageRole;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * A single message within a {@link ChatSession}.
 * Role is either USER (student question) or ASSISTANT (RAG answer).
 */
@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 15)
    private MessageRole role;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * Total tokens consumed by the LLM for this message.
     * Null for USER messages; populated for ASSISTANT messages after RAG call.
     */
    @Column(name = "tokens_used")
    private Integer tokensUsed;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = Instant.now();
    }

    // ─────────── Relationships ───────────

    /** Source citations attached to ASSISTANT messages. Empty for USER messages. */
    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<MessageCitation> citations = new ArrayList<>();
}
