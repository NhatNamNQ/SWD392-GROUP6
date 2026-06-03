package swd392.project.orbitdocsbackend.document.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterSyncRequest {
    
    @NotNull(message = "Document ID is required")
    private UUID documentId;
    
    @NotNull(message = "Job ID is required")
    private UUID jobId;
    
    @NotNull(message = "Chapters list cannot be null")
    private List<ChapterInfo> chapters;

    private Integer chunkCount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapterInfo {
        @NotBlank(message = "Title is required")
        private String title;
        
        @NotNull(message = "Order index is required")
        private Short orderIndex;
        
        private String description;
    }
}
