package swd392.project.orbitdocsbackend.identity.dto.auth.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import swd392.project.orbitdocsbackend.identity.dto.user.response.UserResponse;

@Getter
@Setter
@AllArgsConstructor
public class AuthResponse {
    private UserResponse userResponse;
    private String accessToken;
    private String refreshToken;
}