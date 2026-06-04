package swd392.project.orbitdocsbackend.identity.dtos.auth.request;

public record ConfirmOtpRequest(
        String email,
        String otp
) {}