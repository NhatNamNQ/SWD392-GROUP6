package swd392.project.orbitdocsbackend.identity.entity;

import jakarta.persistence.*;
import lombok.*;
import swd392.project.orbitdocsbackend.shared.entity.BaseEntity;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * System user. A user may hold multiple roles (ADMIN, LECTURER, STUDENT).
 * <p>
 * Module: user
 * </p>
 */
@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(name = "uk_users_email", columnNames = "email"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

        @Id
        @GeneratedValue(strategy = GenerationType.UUID)
        @Column(name = "id", updatable = false, nullable = false)
        private UUID id;

        @Column(name = "email", nullable = false, length = 255)
        private String email;

        @Column(name = "password_hash", nullable = false, length = 255)
        private String passwordHash;

        @Column(name = "full_name", nullable = false, length = 150)
        private String fullName;

        @Column(name = "avatar_url", length = 500)
        private String avatarUrl;

        @Column(name = "is_active", nullable = false)
        @Builder.Default
        private boolean active = true;

        @Column(name = "is_password_changed", nullable = false)
        @Builder.Default
        private boolean passwordChanged = true;

        // ─────────── Relationships ───────────

        @ManyToOne(fetch = FetchType.EAGER, optional = false)
        @JoinColumn(name = "role_id", nullable = false)
        private Role role;

        @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
        @Builder.Default
        private List<RefreshToken> refreshTokens = new ArrayList<>();
}
