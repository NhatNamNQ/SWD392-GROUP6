package swd392.project.orbitdocsbackend.document.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class RagFailureRequest {

    private UUID documentId;
    
    private UUID jobId;
    
    @NotBlank
    private String error;
}
