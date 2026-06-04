package swd392.project.orbitdocsbackend.notification.dtos;

public record ResetPasswordRequest(
        String email,
        String link
) {}