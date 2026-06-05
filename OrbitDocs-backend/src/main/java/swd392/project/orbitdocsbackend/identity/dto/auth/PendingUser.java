package swd392.project.orbitdocsbackend.identity.dto.auth;

public record PendingUser(
        String email,
        String username,
        String password,
        boolean isExpired
) {}