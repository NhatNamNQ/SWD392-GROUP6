package swd392.project.orbitdocsbackend.identity.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swd392.project.orbitdocsbackend.identity.entity.Role;
import swd392.project.orbitdocsbackend.shared.enums.RoleName;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(RoleName name);
    Optional<Role> findById(Short id);
    boolean existsById(Short id);
}
