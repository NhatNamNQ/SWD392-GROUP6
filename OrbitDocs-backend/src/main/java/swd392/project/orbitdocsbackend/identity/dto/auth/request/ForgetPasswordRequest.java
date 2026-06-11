package swd392.project.orbitdocsbackend.identity.dto.auth.request;

import jakarta.validation.constraints.Email;

public record ForgetPasswordRequest(
        @Email
        String email
) {}
