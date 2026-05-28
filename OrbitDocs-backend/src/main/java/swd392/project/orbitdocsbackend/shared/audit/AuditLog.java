package swd392.project.orbitdocsbackend.shared.audit;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import swd392.project.orbitdocsbackend.identity.entity.User;

import java.time.Instant;
import java.util.UUID;

/**
 * Immutable audit record written whenever an Admin or Lecturer performs
 * a significant state-changing action (user management, course changes,
 * document operations, role assignments, etc.).
 *
 * <p>Rows are <em>never updated or deleted</em> — append-only table.</p>
 *
 * <p>Module: admin</p>
 */
@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * The user who performed the action.
     * Nullable: SET NULL on user delete so audit history is preserved.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;

    /**
     * Verb describing the action.
     * Examples: USER_CREATED, DOCUMENT_DELETED, ROLE_ASSIGNED, DOCUMENT_REINDEXED.
     */
    @Column(name = "action", nullable = false, length = 100)
    private String action;

    /**
     * The entity type that was mutated.
     * Examples: "User", "Document", "Course".
     */
    @Column(name = "entity_type", length = 100)
    private String entityType;

    /** PK of the entity that was mutated. */
    @Column(name = "entity_id")
    private UUID entityId;

    /**
     * JSON snapshot of the entity's state BEFORE the change.
     * Null for creation events.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "old_value", columnDefinition = "jsonb")
    private String oldValue;

    /**
     * JSON snapshot of the entity's state AFTER the change.
     * Null for deletion events.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "new_value", columnDefinition = "jsonb")
    private String newValue;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = Instant.now();
    }
}
