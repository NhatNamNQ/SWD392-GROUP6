package swd392.project.orbitdocsbackend.chat.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RenameSessionRequest {
    @NotBlank(message = "Title cannot be blank")
    private String newTitle;
}
