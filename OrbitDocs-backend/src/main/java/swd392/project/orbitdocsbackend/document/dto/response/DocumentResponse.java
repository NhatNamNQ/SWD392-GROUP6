package swd392.project.orbitdocsbackend.document.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import swd392.project.orbitdocsbackend.shared.enums.DocumentStatus;
import swd392.project.orbitdocsbackend.shared.enums.FileType;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {
    private UUID id;
    private UUID courseId;
    private String originalFilename;
    private FileType fileType;
    private Long fileSizeBytes;
    private DocumentStatus status;
    private Integer chunkCount;
    private Instant indexedAt;
    private Instant createdAt;
    private Instant updatedAt;
}
