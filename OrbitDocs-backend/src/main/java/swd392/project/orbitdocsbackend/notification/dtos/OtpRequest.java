package swd392.project.orbitdocsbackend.notification.dtos;

public record OtpRequest(
        String email,
        String otp
) {}