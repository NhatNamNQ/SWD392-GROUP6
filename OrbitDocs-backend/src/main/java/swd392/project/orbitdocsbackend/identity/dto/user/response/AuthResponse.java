package swd392.project.orbitdocsbackend.identity.dto.user.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuthResponse {
    private UserResponse userResponse;
    private String accessToken;
    private String refreshToken;
}