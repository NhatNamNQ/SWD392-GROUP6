package swd392.project.orbitdocsbackend.identity.controller;


import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swd392.project.orbitdocsbackend.identity.abstractions.services.IAuthService;
import swd392.project.orbitdocsbackend.identity.dto.auth.request.*;
import swd392.project.orbitdocsbackend.identity.dto.auth.response.ConfirmOtpResult;
import swd392.project.orbitdocsbackend.identity.dto.auth.response.EmailActionResponse;
import swd392.project.orbitdocsbackend.identity.dto.auth.response.AuthResponse;
import swd392.project.orbitdocsbackend.identity.dto.user.response.UserResponse;
import swd392.project.orbitdocsbackend.shared.response.ApiResponse;

import javax.management.relation.RoleNotFoundException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IAuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(
            @Valid @RequestBody RegisterRequest request) {

        authService.register(request);

        return ResponseEntity.ok(
                ApiResponse.success(null, "Register successfully")
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<EmailActionResponse>> forgotPassword(
            @Valid @RequestBody ForgetPasswordRequest request) {

        EmailActionResponse response = authService.forgetPassword(request);

        return ResponseEntity.ok(ApiResponse.success(response, "OTP sent successfully"));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<EmailActionResponse>> resendOtp(
            @Valid @RequestBody ResendOtpRequest request) {

        EmailActionResponse response = authService.reSendOtp(request);

        return ResponseEntity.ok(
                ApiResponse.success(response, "OTP resent successfully")
        );
    }

    @PostMapping("/confirm-otp")
    public ResponseEntity<ApiResponse<ConfirmOtpResult>> confirmOtp(
            @RequestBody ConfirmOtpRequest request) throws RoleNotFoundException {

        ConfirmOtpResult response = authService.confirmOtp(request);

        return ResponseEntity.ok(
                ApiResponse.success(response, "OTP confirmed successfully")
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request);

        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {

        AuthResponse authResponse = authService.login(request);

        Cookie refreshToken = new Cookie(
                "refreshToken",
                authResponse.getRefreshToken()
        );

        refreshToken.setHttpOnly(true);
        refreshToken.setPath("/");
        refreshToken.setMaxAge(60 * 60 * 24 * 7);

        response.addCookie(refreshToken);

        authResponse.setRefreshToken("");

        return ResponseEntity.ok(
                ApiResponse.success(authResponse, "Login successfully")
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @CookieValue("refreshToken") RefreshRequest refreshToken,
            HttpServletResponse response) {

        AuthResponse authResponse = authService.refresh(refreshToken);
        authResponse.setRefreshToken("");

        return ResponseEntity.ok(
                ApiResponse.success(authResponse, "Token refreshed successfully")
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {

        if (refreshToken != null) {
            authService.logout(refreshToken);
        }

        Cookie refreshCookie = new Cookie("refreshToken", null);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0);

        response.addCookie(refreshCookie);

        return ResponseEntity.ok(
                ApiResponse.success(null, "Logout successfully")
        );
    }
}