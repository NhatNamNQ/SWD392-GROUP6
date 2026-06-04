package swd392.project.orbitdocsbackend.identity.dtos.user.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
@Getter
@Setter
public class UserCommonRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String fullName;

    private Boolean active;

    private String avatarUrl;

    private String avatarPublicId;
    
    private String roleId; // nhận từ client (UUID dạng string)
}

