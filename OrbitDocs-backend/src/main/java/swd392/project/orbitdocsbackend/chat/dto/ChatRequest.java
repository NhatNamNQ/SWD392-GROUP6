package swd392.project.orbitdocsbackend.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ChatRequest {
    @NotNull(message = "Course ID is required")
    private UUID courseId;

    private UUID documentId; // Optional: restrict to a specific document
    
    private UUID chapterId; // Optional: restrict to a specific chapter

    @NotBlank(message = "Query cannot be blank")
    private String query;

    private UUID sessionId; // Optional: if continuing an existing chat
}
