package swd392.project.orbitdocsbackend.document.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentChunkResponse {
    private UUID id;
    private UUID documentId;
    private Integer chunkIndex;
    private String content;
    private Integer tokenCount;
    private Map<String, Object> metadata;
    private Instant createdAt;
}
