package swd392.project.orbitdocsbackend.chat.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import swd392.project.orbitdocsbackend.chat.dto.ChatRequest;
import swd392.project.orbitdocsbackend.chat.dto.ChatResponse;
import swd392.project.orbitdocsbackend.chat.dto.ChatSessionDto;
import swd392.project.orbitdocsbackend.chat.service.IChatService;
import swd392.project.orbitdocsbackend.identity.dtos.user.CustomUserDetails;
import swd392.project.orbitdocsbackend.shared.response.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final IChatService chatService;

    private UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) auth.getPrincipal()).user().getId();
        }
        throw new RuntimeException("Unauthorized");
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ChatResponse> sendMessage(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = chatService.sendMessage(request, getCurrentUserId());
        return ApiResponse.success(response, "Message sent successfully");
    }

    @GetMapping("/sessions")
    public ApiResponse<List<ChatSessionDto>> getSessions() {
        return ApiResponse.success(chatService.getUserSessions(getCurrentUserId()));
    }

    @GetMapping("/sessions/{sessionId}")
    public ApiResponse<ChatSessionDto> getSessionDetails(@PathVariable UUID sessionId) {
        return ApiResponse.success(chatService.getSessionDetails(sessionId, getCurrentUserId()));
    }
}
