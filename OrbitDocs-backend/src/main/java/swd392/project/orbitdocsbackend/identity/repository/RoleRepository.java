package swd392.project.orbitdocsbackend.identity.repository;

import swd392.project.orbitdocsbackend.identity.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.Optional;
import swd392.project.orbitdocsbackend.shared.enums.RoleName;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(RoleName name);
}

