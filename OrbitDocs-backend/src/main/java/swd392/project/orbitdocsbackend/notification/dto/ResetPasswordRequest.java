package swd392.project.orbitdocsbackend.notification.dto;

public record ResetPasswordRequest(
        String email,
        String link
) {}