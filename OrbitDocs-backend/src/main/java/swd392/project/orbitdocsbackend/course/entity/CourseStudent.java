package swd392.project.orbitdocsbackend.course.entity;

import jakarta.persistence.*;
import lombok.*;
import swd392.project.orbitdocsbackend.identity.entity.User;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "course_students", uniqueConstraints = @UniqueConstraint(columnNames = {"course_id", "student_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseStudent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "joined_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant joinedAt = Instant.now();
}
