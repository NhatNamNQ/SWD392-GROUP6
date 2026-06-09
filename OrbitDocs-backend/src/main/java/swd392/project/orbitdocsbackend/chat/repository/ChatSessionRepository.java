package swd392.project.orbitdocsbackend.chat.repository;

import swd392.project.orbitdocsbackend.chat.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {
    List<ChatSession> findByUserIdAndActiveTrueOrderByLastMessageAtDesc(UUID userId);
    Optional<ChatSession> findByIdAndUserIdAndActiveTrue(UUID id, UUID userId);
}

