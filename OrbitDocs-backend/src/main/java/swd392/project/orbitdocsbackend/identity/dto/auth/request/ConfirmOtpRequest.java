package swd392.project.orbitdocsbackend.identity.dto.auth.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import swd392.project.orbitdocsbackend.notification.dto.Enums.OtpType;

public record ConfirmOtpRequest(
        @Email
        @NotNull
        String email,
        @NotNull
        String otp,
        @NotNull
        OtpType type
) {}