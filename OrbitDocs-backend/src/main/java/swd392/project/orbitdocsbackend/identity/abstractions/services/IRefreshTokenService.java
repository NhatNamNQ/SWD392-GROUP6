package swd392.project.orbitdocsbackend.identity.abstractions.services;


import swd392.project.orbitdocsbackend.identity.entity.RefreshToken;
import swd392.project.orbitdocsbackend.identity.entity.User;

public interface IRefreshTokenService {
    String createRefreshToken(User user);
    RefreshToken validateRefreshToken(String token);
    String refreshAccessToken(String refreshToken);
    void revokeToken(String token);
}
