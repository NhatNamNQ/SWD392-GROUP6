package swd392.project.orbitdocsbackend.course.entity;

import jakarta.persistence.*;
import lombok.*;
import swd392.project.orbitdocsbackend.document.entity.Document;
import swd392.project.orbitdocsbackend.identity.entity.User;
import swd392.project.orbitdocsbackend.shared.entity.BaseEntity;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * A university course (e.g. SWD392, PRN211).
 * Each course has exactly one assigned lecturer who can upload documents.
 * Students can access all courses freely without enrollment.
 */
@Entity
@Table(name = "courses", uniqueConstraints = @UniqueConstraint(name = "uk_courses_code", columnNames = "code"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /** Short course code, e.g. "SWD392". Must be unique. */
    @Column(name = "code", nullable = false, length = 20)
    private String code;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    // ─────────── Relationships ───────────

    /** The single lecturer assigned to this course. This person uploads documents. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecturer_id")
    private User lecturer;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Document> documents = new ArrayList<>();
}
