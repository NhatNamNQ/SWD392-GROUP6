package swd392.project.orbitdocsbackend.identity.abstractions.services;


import swd392.project.orbitdocsbackend.identity.dtos.auth.request.ConfirmOtpRequest;
import swd392.project.orbitdocsbackend.identity.dtos.auth.request.LoginRequest;
import swd392.project.orbitdocsbackend.identity.dtos.auth.request.RefreshRequest;
import swd392.project.orbitdocsbackend.identity.dtos.auth.request.RegisterRequest;
import swd392.project.orbitdocsbackend.identity.dtos.user.response.AuthResponse;
import swd392.project.orbitdocsbackend.identity.dtos.user.response.UserResponse;

public interface IAuthService {
    void register(RegisterRequest request);
    UserResponse confirmOtp(ConfirmOtpRequest request);

    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshRequest request);
    void logout(String accessToken);
}
