package swd392.project.orbitdocsbackend.identity.dto.auth.response;

public record ForgotPasswordResponse(
        String email,
        boolean verified,
        String message,
        String resetToken
) {}
