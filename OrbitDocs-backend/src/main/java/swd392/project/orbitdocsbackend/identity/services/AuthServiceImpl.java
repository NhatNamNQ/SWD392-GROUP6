package swd392.project.orbitdocsbackend.identity.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swd392.project.orbitdocsbackend.identity.abstractions.cache.IRedisTokenService;
import swd392.project.orbitdocsbackend.identity.abstractions.repositories.RoleRepository;
import swd392.project.orbitdocsbackend.identity.abstractions.repositories.UserRepository;
import swd392.project.orbitdocsbackend.identity.abstractions.services.IAuthService;
import swd392.project.orbitdocsbackend.identity.dtos.auth.PendingUser;
import swd392.project.orbitdocsbackend.identity.dtos.auth.request.ConfirmOtpRequest;
import swd392.project.orbitdocsbackend.identity.dtos.auth.request.LoginRequest;
import swd392.project.orbitdocsbackend.identity.dtos.auth.request.RefreshRequest;
import swd392.project.orbitdocsbackend.identity.dtos.auth.request.RegisterRequest;
import swd392.project.orbitdocsbackend.identity.dtos.user.CustomUserDetails;
import swd392.project.orbitdocsbackend.identity.dtos.user.response.AuthResponse;
import swd392.project.orbitdocsbackend.identity.dtos.user.response.UserResponse;
import swd392.project.orbitdocsbackend.identity.entity.RefreshToken;
import swd392.project.orbitdocsbackend.identity.entity.Role;
import swd392.project.orbitdocsbackend.identity.entity.User;
import swd392.project.orbitdocsbackend.identity.exceptions.auth.EmailNotFoundException;
import swd392.project.orbitdocsbackend.identity.exceptions.auth.OtpLockoutException;
import swd392.project.orbitdocsbackend.identity.exceptions.auth.WrongOtpCodeException;
import swd392.project.orbitdocsbackend.identity.exceptions.auth.WrongPasswordException;
import swd392.project.orbitdocsbackend.identity.mapper.UserMapper;
import swd392.project.orbitdocsbackend.identity.services.cache.OtpAttemptTracker;
import swd392.project.orbitdocsbackend.identity.services.cache.RefreshTokenServiceImpl;
import swd392.project.orbitdocsbackend.notification.abstractions.INotificationService;
import swd392.project.orbitdocsbackend.notification.abstractions.cache.IRedisOtpService;
import swd392.project.orbitdocsbackend.notification.dtos.Enums.OtpType;
import swd392.project.orbitdocsbackend.notification.dtos.OtpNotificationRequest;
import swd392.project.orbitdocsbackend.notification.dtos.OtpRequest;
import swd392.project.orbitdocsbackend.shared.enums.RoleName;
import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtServiceImpl jwtService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final RefreshTokenServiceImpl refreshTokenService;
    private final IRedisTokenService redisTokenService;
    private final UserMapper userMapper;
    private final ObjectMapper objectMapper;
    private final RoleRepository roleRepository;
    private final INotificationService notificationService;
    private final IRedisOtpService otpService;
    private final OtpAttemptTracker otpAttemptTracker;


    @Override
    @Transactional
    public void register(RegisterRequest request) {

        String key = "PENDING_USER:" + request.email();
        // 1. generate OTP
        String otp = generateOtp();

        if (userRepository.findByEmail(request.email()).isPresent()
                || redisTemplate.hasKey(key)) {
            throw new RuntimeException(String.valueOf(ErrorCode.EMAIL_NOT_FOUND));
        }

        // 2. create pending user object (staging in Redis)
        PendingUser pendingUser = new PendingUser(
                request.email(),
                request.fullName(),
                request.password(),
                false // hashed otp is no longer stored in pending user
        );
        // 3. save to Redis
        try {
            redisTemplate.opsForValue()
                    .set(key, objectMapper.writeValueAsString(pendingUser), Duration.ofMinutes(5));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        
        // 4. create OTP notification
        notificationService.OtpNotificationHandler(new OtpNotificationRequest(
                new OtpRequest(request.email(), otp),
                request.email()+ otp,
                OtpType.REGISTER
        ));
    }

    @Override
    @Transactional
    public UserResponse confirmOtp(ConfirmOtpRequest request) {

        String email = request.email();

        // 1. Check if email is locked out
        if (otpAttemptTracker.isLockedOut(email)) {
            long remainingTime = otpAttemptTracker.getLockoutRemainingTime(email);
            throw new OtpLockoutException(remainingTime);
        }

        String key = "PENDING_USER:" + email;
        String json = (String) redisTemplate.opsForValue().get(key);

        PendingUser pendingUser = null;
        try {
            pendingUser = objectMapper.readValue(json, PendingUser.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        if (pendingUser == null) {
            throw new RuntimeException(ErrorCode.PENDING_USER_NOT_FOUND.getMessage());
        }

        // 2. Validate OTP using Lua script
        if (request.otp() == null || !otpService.validateOtp(email, request.otp())) {
            int remainingAttempts = otpAttemptTracker.recordFailedAttempt(email);
            
            if (remainingAttempts <= 0) {
                long lockoutTime = otpAttemptTracker.getLockoutRemainingTime(email);
                throw new OtpLockoutException(lockoutTime);
            }
            throw new WrongOtpCodeException();
        }

        // 3. Create user
        User user = new User();
        user.setEmail(pendingUser.email());
        user.setFullName(pendingUser.username());
        user.setPasswordHash(passwordEncoder.encode(pendingUser.password()));
        RoleName roleName = RoleName.STUDENT;
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException(ErrorCode.ROLE_NOT_FOUND.getMessage()));
        user.setRole(role);
        user.setCreatedAt(Instant.now());

        userRepository.save(user);
        
        // 4. Cleanup: delete pending user and reset OTP attempts
        redisTemplate.delete(key);
        otpAttemptTracker.resetAttempts(email);
        
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(EmailNotFoundException::new);
        if (!user.isActive()) {
            throw new RuntimeException("User is unactive.");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new WrongPasswordException();
        }
        UserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(
                userMapper.toResponse(user),
                accessToken,
                refreshToken
        );
    }
    @Override
    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken token = refreshTokenService.validateRefreshToken(request.getRefreshToken());
        UserDetails userDetails = new CustomUserDetails(token.getUser());
        String newAccessToken = jwtService.generateToken(userDetails);
        refreshTokenService.revokeToken(token.getTokenHash());
        User user = token.getUser();
        return new AuthResponse(
                userMapper.toResponse(user),
                newAccessToken,
                request.getRefreshToken()
        );
    }
    @Override
    public void logout(String accessToken) {

        String jti = jwtService.extractJwtId(accessToken);
        long ttl = getRemainingTime(accessToken);
        redisTokenService.blacklistToken(jti, ttl);

    }

// Function Helper
    public long getRemainingTime(String token) {
        long ttl = jwtService.extractExpiration(token).getTime() - System.currentTimeMillis();
        return Math.max(ttl, 0);
    }
    private String generateOtp() {
        return String.valueOf((int)(Math.random() * 900000) + 100000);
    }
}

