package swd392.project.orbitdocsbackend.chat.service;

import swd392.project.orbitdocsbackend.chat.dto.ChatRequest;
import swd392.project.orbitdocsbackend.chat.dto.ChatResponse;
import swd392.project.orbitdocsbackend.chat.dto.ChatSessionDto;

import java.util.List;
import java.util.UUID;

public interface IChatService {
    ChatResponse sendMessage(ChatRequest request, UUID userId);

    List<ChatSessionDto> getUserSessions(UUID userId);

    ChatSessionDto getSessionDetails(UUID sessionId, UUID userId);

    ChatSessionDto renameSession(UUID sessionId, String newTitle, UUID userId);
}
