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
import swd392.project.orbitdocsbackend.identity.dto.auth.PendingUser;
import swd392.project.orbitdocsbackend.identity.dto.auth.request.*;
import swd392.project.orbitdocsbackend.identity.dto.auth.response.ConfirmOtpResult;
import swd392.project.orbitdocsbackend.identity.dto.auth.response.EmailActionResponse;
import swd392.project.orbitdocsbackend.identity.dto.auth.response.ForgotPasswordResponse;
import swd392.project.orbitdocsbackend.identity.dto.user.CustomUserDetails;
import swd392.project.orbitdocsbackend.identity.dto.auth.response.AuthResponse;
import swd392.project.orbitdocsbackend.identity.entity.RefreshToken;
import swd392.project.orbitdocsbackend.identity.entity.Role;
import swd392.project.orbitdocsbackend.identity.entity.User;
import swd392.project.orbitdocsbackend.identity.exception.RedisDataNotFoundException;
import swd392.project.orbitdocsbackend.identity.exception.auth.EmailNotFoundException;
import swd392.project.orbitdocsbackend.identity.exception.auth.OtpLockoutException;
import swd392.project.orbitdocsbackend.identity.exception.auth.RequirePasswordChangeException;
import swd392.project.orbitdocsbackend.identity.exception.auth.WrongOtpCodeException;
import swd392.project.orbitdocsbackend.identity.exception.auth.WrongPasswordException;
import swd392.project.orbitdocsbackend.identity.exception.token.TokenExpiredException;
import swd392.project.orbitdocsbackend.identity.exception.user.UserNotFoundException;
import swd392.project.orbitdocsbackend.identity.mapper.UserMapper;
import swd392.project.orbitdocsbackend.identity.services.cache.OtpAttemptTracker;
import swd392.project.orbitdocsbackend.identity.services.cache.RefreshTokenServiceImpl;
import swd392.project.orbitdocsbackend.notification.abstractions.INotificationService;
import swd392.project.orbitdocsbackend.notification.abstractions.cache.IRedisOtpService;
import swd392.project.orbitdocsbackend.notification.dto.Enums.OtpType;
import swd392.project.orbitdocsbackend.notification.dto.OtpNotificationRequest;
import swd392.project.orbitdocsbackend.notification.dto.OtpRequest;
import swd392.project.orbitdocsbackend.shared.enums.RoleName;
import swd392.project.orbitdocsbackend.shared.exception.AppException;
import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

import javax.management.relation.RoleNotFoundException;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import static swd392.project.orbitdocsbackend.notification.dto.Enums.OtpType.FORGET_PASSWORD;
import static swd392.project.orbitdocsbackend.notification.dto.Enums.OtpType.REGISTER;

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

        String key = OtpType.REGISTER + request.email();
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
                REGISTER
        ));
    }

    @Override
    public EmailActionResponse forgetPassword(ForgetPasswordRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(EmailNotFoundException::new);
        if (!user.isActive()) {
            throw new AppException(ErrorCode.USER_INACTIVE);
        }
        String key = FORGET_PASSWORD + request.email();
        String otp = generateOtp();

        saveToRedis(key,otp,Duration.ofMinutes(5));

        notificationService.OtpNotificationHandler(new OtpNotificationRequest(
                new OtpRequest(request.email(), otp),
                request.email() + otp,
                FORGET_PASSWORD));

        return EmailActionResponse.builder()
                .email(request.email())
                .expireIn(5 * 60)
                .build();
    }

    @Override
    public EmailActionResponse reSendOtp(ResendOtpRequest request) {
        String otp = generateOtp();

        notificationService.OtpNotificationHandler(
                new OtpNotificationRequest(
                        new OtpRequest(request.email(), otp),
                        request.email() + System.currentTimeMillis(),
                        request.type()
                )
        );

        return EmailActionResponse.builder()
                .email(request.email())
                .expireIn(5 * 60)
                .build();
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        String key = "reset:" + request.resetToken();

        String email = (String) redisTemplate.opsForValue().get(key);

        if (email == null) {
            throw new TokenExpiredException();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(EmailNotFoundException::new);

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        redisTemplate.delete(key);
    }

    @Override
    @Transactional
    public ConfirmOtpResult confirmOtp(ConfirmOtpRequest request) {

        String email = request.email();

        validateOtpOrThrow(request.type().toString(),email, request.otp());

        return switch (request.type()) {

            case REGISTER -> {
                try {
                    yield confirmRegisterOtp(email);
                } catch (RoleNotFoundException e) {
                    throw new RuntimeException(e);
                }
            }

            case FORGET_PASSWORD -> confirmForgotPasswordOtp(email);

            default -> throw new IllegalStateException("Unexpected value: " + request.type());
        };
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(EmailNotFoundException::new);
        if (!user.isActive()) {
            throw new AppException(ErrorCode.USER_INACTIVE);
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new WrongPasswordException();
        }
        UserDetails userDetails = new CustomUserDetails(user);

        if (!user.isPasswordChanged()) {
            String tempToken = jwtService.generateToken(userDetails);
            throw new AppException(ErrorCode.REQUIRE_PASSWORD_CHANGE,tempToken);
        }

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

    @Override
    @Transactional
    public AuthResponse forceChangePassword(String username, ForceChangePasswordRequest request) {
        User user = userRepository.findByFullName(username)
                .orElseThrow(UserNotFoundException::new);

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setPasswordChanged(true);
        userRepository.save(user);

        UserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(
                userMapper.toResponse(user),
                accessToken,
                refreshToken
        );
    }

// Function Helper
    public long getRemainingTime(String token) {
        long ttl = jwtService.extractExpiration(token).getTime() - System.currentTimeMillis();
        return Math.max(ttl, 0);
    }
    private String generateOtp() {
        return String.valueOf((int)(Math.random() * 900000) + 100000);
    }

    private void saveToRedis(String key, Object value, Duration ttl) {
        try {
            if (redisTemplate.hasKey(key)) {
                redisTemplate.delete(key);
            }

            redisTemplate.opsForValue()
                    .set(key, objectMapper.writeValueAsString(value), ttl);

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to save data to Redis", e);
        }
    }
    private <T> T getFromRedis(
            String key,
            Class<T> clazz
    ) {
        String json = (String) redisTemplate.opsForValue().get(key);

        if (json == null) {
            throw new RedisDataNotFoundException();
        }

        try {
            return objectMapper.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private void validateOtpOrThrow(String type, String email, String otp) {

        if (otpAttemptTracker.isLockedOut(email)) {
            long remainingTime = otpAttemptTracker.getLockoutRemainingTime(email);

            throw new OtpLockoutException(remainingTime);
        }

        boolean valid = otpService.validateOtp(type,email, otp);

        if (!valid) {
            int remainingAttempts = otpAttemptTracker.recordFailedAttempt(email);

            if (remainingAttempts <= 0) {
                long lockoutTime = otpAttemptTracker.getLockoutRemainingTime(email);

                throw new OtpLockoutException(lockoutTime);
            }

            throw new WrongOtpCodeException();
        }
    }

    private ConfirmOtpResult confirmRegisterOtp(String email) throws RoleNotFoundException {

        String key = REGISTER + email;

        PendingUser pendingUser =
                getFromRedis(key, PendingUser.class);

        User user = new User();

        user.setEmail(pendingUser.email());
        user.setFullName(pendingUser.username());
        user.setPasswordHash(passwordEncoder.encode(pendingUser.password()));
        user.setActive(true);
        MapStudentRoleToUser(email, key, user);

        return new ConfirmOtpResult(
                REGISTER.toString(),
                userMapper.toResponse(user)
        );
    }

    private void MapStudentRoleToUser(String email, String key, User user) {
        RoleName roleName = RoleName.STUDENT;
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException(ErrorCode.ROLE_NOT_FOUND.getMessage()));
        user.setRole(role);
        user.setCreatedAt(Instant.now());
        userRepository.save(user);

        redisTemplate.delete(key);
        otpAttemptTracker.resetAttempts(email);
    }

    private ConfirmOtpResult confirmForgotPasswordOtp(
            String email
    ) {

        String key = FORGET_PASSWORD + email;

        String resetToken = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(
                "reset:" + resetToken,
                email,
                Duration.ofMinutes(5)
        );

        redisTemplate.delete(key);
        otpAttemptTracker.resetAttempts(email);

        return new ConfirmOtpResult(
                REGISTER.toString(),
                new ForgotPasswordResponse(email, true,"OTP verified. You can now reset your password",resetToken)
        );
    }
}

