package swd392.project.orbitdocsbackend.course.entity;

import jakarta.persistence.*;
import lombok.*;
import swd392.project.orbitdocsbackend.identity.entity.User;
import java.time.Instant;
import java.util.UUID;

/**
 * Assignment of a Lecturer to a Course.
 * Business rule: a Lecturer may only upload documents to courses
 * they appear in via this join table.
 */
@Entity
@Table(name = "course_lecturers", uniqueConstraints = @UniqueConstraint(name = "uk_course_lecturer", columnNames = {
        "course_id", "lecturer_id" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseLecturer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lecturer_id", nullable = false)
    private User lecturer;

    @Column(name = "assigned_at", nullable = false, updatable = false)
    private Instant assignedAt;

    @PrePersist
    void prePersist() {
        this.assignedAt = Instant.now();
    }
}
