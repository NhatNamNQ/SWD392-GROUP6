package swd392.project.orbitdocsbackend.document.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterResponse {
    private UUID id;
    private UUID documentId;
    private Short orderIndex;
    private String title;
    private String description;
    private Instant createdAt;
    private Instant updatedAt;
}
