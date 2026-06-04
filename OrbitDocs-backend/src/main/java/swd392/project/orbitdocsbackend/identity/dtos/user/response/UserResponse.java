package swd392.project.orbitdocsbackend.identity.dtos.user.response;

import lombok.Getter;
import lombok.Setter;
import swd392.project.orbitdocsbackend.identity.dtos.role.response.RoleResponse;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class UserResponse {

    private UUID id;

    private String email;
    private String fullName;

    private Boolean active;

    private String avatarUrl;

    private Instant createdAt;
    private Instant updatedAt;

    private RoleResponse roleResponse;
}
