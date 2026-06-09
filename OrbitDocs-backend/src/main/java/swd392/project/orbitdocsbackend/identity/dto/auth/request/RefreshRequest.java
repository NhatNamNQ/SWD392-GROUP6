package swd392.project.orbitdocsbackend.identity.dtos.auth.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RefreshRequest {
    private String refreshToken;
}