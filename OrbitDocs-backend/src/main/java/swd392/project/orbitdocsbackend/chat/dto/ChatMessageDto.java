package swd392.project.orbitdocsbackend.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import swd392.project.orbitdocsbackend.shared.enums.MessageRole;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private UUID id;
    private MessageRole role;
    private String content;
    private Instant createdAt;
    private List<CitationDto> citations;
}
