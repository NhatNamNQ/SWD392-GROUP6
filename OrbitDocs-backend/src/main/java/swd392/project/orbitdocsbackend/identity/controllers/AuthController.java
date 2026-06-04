package swd392.project.orbitdocsbackend.identity.controllers;


import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swd392.project.orbitdocsbackend.identity.abstractions.services.IAuthService;
import swd392.project.orbitdocsbackend.identity.dtos.auth.request.ConfirmOtpRequest;
import swd392.project.orbitdocsbackend.identity.dtos.auth.request.LoginRequest;
import swd392.project.orbitdocsbackend.identity.dtos.auth.request.RefreshRequest;
import swd392.project.orbitdocsbackend.identity.dtos.auth.request.RegisterRequest;
import swd392.project.orbitdocsbackend.identity.dtos.user.response.AuthResponse;
import swd392.project.orbitdocsbackend.identity.dtos.user.response.UserResponse;
import swd392.project.orbitdocsbackend.identity.exceptions.token.TokenExpiredException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IAuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/confirm-otp")
    public UserResponse confirmOtp(@RequestBody ConfirmOtpRequest request){
        return authService.confirmOtp(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {

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
        return authResponse;
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(
            @CookieValue("refreshToken") RefreshRequest refreshToken,
            HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.refresh(refreshToken);
        authResponse.setRefreshToken("");
        return authResponse;
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            throw new TokenExpiredException();
        }

        String token = header.substring(7);
        authService.logout(token);

        return ResponseEntity.ok().build();
    }
}