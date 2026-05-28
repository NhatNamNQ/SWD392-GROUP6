package swd392.project.orbitdocsbackend.chat.entity;

import jakarta.persistence.*;
import lombok.*;
import swd392.project.orbitdocsbackend.course.entity.Course;
import swd392.project.orbitdocsbackend.document.entity.Chapter;
import swd392.project.orbitdocsbackend.document.entity.Document;
import swd392.project.orbitdocsbackend.shared.entity.BaseEntity;
import swd392.project.orbitdocsbackend.identity.entity.User;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * A conversation session between a Student and the RAG chatbot.
 * Every session is scoped to a {@link Course} and optionally a {@link Chapter}
 * to restrict the RAG retriever's search space.
 *
 * <p>
 * Module: chat
 * </p>
 */
@Entity
@Table(name = "chat_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSession extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    /**
     * Multi-select Documents. Empty means the entire course is searched.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "chat_session_documents", joinColumns = @JoinColumn(name = "session_id"), inverseJoinColumns = @JoinColumn(name = "document_id"))
    @Builder.Default
    private List<Document> documents = new ArrayList<>();

    /**
     * Multi-select Chapters for even finer granularity.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "chat_session_chapters", joinColumns = @JoinColumn(name = "session_id"), inverseJoinColumns = @JoinColumn(name = "chapter_id"))
    @Builder.Default
    private List<Chapter> chapters = new ArrayList<>();

    /**
     * Auto-generated from the first user message (truncated to 300 chars).
     * Null until the first message is sent.
     */
    @Column(name = "title", length = 300)
    private String title;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    /** Updated on every new message; used to sort sessions by recency. */
    @Column(name = "last_message_at")
    private Instant lastMessageAt;

    // ─────────── Relationships ───────────

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("created_at ASC")
    @Builder.Default
    private List<ChatMessage> messages = new ArrayList<>();
}
