package swd392.project.orbitdocsbackend.identity.dto.auth.request;

public record ConfirmOtpRequest(
        String email,
        String otp
) {}