package swd392.project.orbitdocsbackend.chat.repository;

import swd392.project.orbitdocsbackend.chat.entity.MessageCitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface MessageCitationRepository extends JpaRepository<MessageCitation, UUID> {
    List<MessageCitation> findByMessageId(UUID messageId);
}

