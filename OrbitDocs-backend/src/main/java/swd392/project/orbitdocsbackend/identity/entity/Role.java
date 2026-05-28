package swd392.project.orbitdocsbackend.identity.entity;

import jakarta.persistence.*;
import lombok.*;
import swd392.project.orbitdocsbackend.shared.enums.RoleName;

import java.util.LinkedHashSet;
import java.util.Set;

/**
 * System role — seeded by data.sql at startup.
 * Values: ADMIN, LECTURER, STUDENT.
 * <p>Module: user</p>
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Short id;

    @Enumerated(EnumType.STRING)
    @Column(name = "name", nullable = false, unique = true, length = 30)
    private RoleName name;

    @Column(name = "description", length = 200)
    private String description;

    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<User> users = new LinkedHashSet<>();
}
