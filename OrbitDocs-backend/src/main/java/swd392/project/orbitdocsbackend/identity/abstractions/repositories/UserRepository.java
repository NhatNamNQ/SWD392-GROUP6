package swd392.project.orbitdocsbackend.identity.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swd392.project.orbitdocsbackend.identity.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    List<User> findByEmailContains(String email);

    Optional<User> findByEmail(String email);

    Optional<User> findByFullName(String fullName);

    @SuppressWarnings("NullableProblems")
    boolean existsById(UUID Id);
}
