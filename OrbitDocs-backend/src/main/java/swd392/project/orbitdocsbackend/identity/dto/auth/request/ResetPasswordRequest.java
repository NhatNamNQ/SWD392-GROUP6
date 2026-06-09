package swd392.project.orbitdocsbackend.identity.dto.auth.request;

public record ResetPasswordRequest(
        String resetToken,
        String newPassword
) {
}
