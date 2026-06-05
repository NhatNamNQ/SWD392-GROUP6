package swd392.project.orbitdocsbackend.notification.dto;

public record OtpRequest(
        String email,
        String otp
) {}