package swd392.project.orbitdocsbackend.identity.repository;

import swd392.project.orbitdocsbackend.identity.entity.RefreshToken;
import swd392.project.orbitdocsbackend.identity.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    int deleteByUser(User user);
}

