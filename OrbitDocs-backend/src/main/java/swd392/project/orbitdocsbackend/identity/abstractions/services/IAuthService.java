package swd392.project.orbitdocsbackend.identity.abstractions.services;


import swd392.project.orbitdocsbackend.identity.dto.auth.request.ConfirmOtpRequest;
import swd392.project.orbitdocsbackend.identity.dto.auth.request.LoginRequest;
import swd392.project.orbitdocsbackend.identity.dto.auth.request.RefreshRequest;
import swd392.project.orbitdocsbackend.identity.dto.auth.request.RegisterRequest;
import swd392.project.orbitdocsbackend.identity.dto.user.response.AuthResponse;
import swd392.project.orbitdocsbackend.identity.dto.user.response.UserResponse;

public interface IAuthService {
    void register(RegisterRequest request);
    UserResponse confirmOtp(ConfirmOtpRequest request);

    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshRequest request);
    void logout(String accessToken);
}
