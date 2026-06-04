package swd392.project.orbitdocsbackend.identity.services.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import swd392.project.orbitdocsbackend.identity.abstractions.repositories.RefreshTokenRepository;
import swd392.project.orbitdocsbackend.identity.abstractions.services.IRefreshTokenService;
import swd392.project.orbitdocsbackend.identity.dtos.user.CustomUserDetails;
import swd392.project.orbitdocsbackend.identity.entity.RefreshToken;
import swd392.project.orbitdocsbackend.identity.entity.User;
import swd392.project.orbitdocsbackend.identity.exceptions.token.InvalidTokenException;
import swd392.project.orbitdocsbackend.identity.exceptions.token.TokenExpiredException;
import swd392.project.orbitdocsbackend.identity.exceptions.token.TokenRevokedException;
import swd392.project.orbitdocsbackend.identity.services.JwtServiceImpl;
import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements IRefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtServiceImpl jwtService;

    @Value("${jwt.refresh-token-expiry-seconds}")
    private long refreshTokenDays;

    @Override
    public String createRefreshToken(User user) {
        RefreshToken token = new RefreshToken();

        token.setTokenHash(UUID.randomUUID().toString());
        token.setUser(user);
        token.setExpiresAt(
                Instant.now().plus(refreshTokenDays, ChronoUnit.DAYS)
        );

        refreshTokenRepository.save(token);
        return token.getTokenHash();
    }

    @Override
    public RefreshToken validateRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(token)
                .orElseThrow(InvalidTokenException::new);

        if (refreshToken.isRevoked()) {
            throw new TokenRevokedException();
        }

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new TokenExpiredException();
        }

        return refreshToken;
    }

    @Override
    public String refreshAccessToken(String refreshTokenStr) {

        RefreshToken refreshToken = validateRefreshToken(refreshTokenStr);

        // revoke token cũ
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = refreshToken.getUser();
        // tạo token mới
        UserDetails userDetails = new CustomUserDetails(user);
        return jwtService.generateToken(userDetails);
    }

    @Override
    public void revokeToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(token)
                .orElseThrow(() -> new RuntimeException("Token not found"));
        if (refreshToken.isRevoked()) {
            return;
        }
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
    }
}
