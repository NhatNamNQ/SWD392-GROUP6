package swd392.project.orbitdocsbackend.identity.abstractions.services;

import org.springframework.security.core.userdetails.UserDetails;

public interface IJwtService {
    String extractUsername(String token);
    String extractJwtId(String token);
    boolean isTokenValid(String token, UserDetails userDetails);
}
