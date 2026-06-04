package swd392.project.orbitdocsbackend.notification.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import swd392.project.orbitdocsbackend.notification.abstractions.IEmailSender;
import swd392.project.orbitdocsbackend.notification.abstractions.INotificationService;
import swd392.project.orbitdocsbackend.notification.abstractions.cache.IRedisIdempotencyService;
import swd392.project.orbitdocsbackend.notification.abstractions.cache.IRedisOtpService;
import swd392.project.orbitdocsbackend.notification.abstractions.cache.IRedisRateLimitService;
import swd392.project.orbitdocsbackend.notification.dtos.OtpNotificationRequest;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements INotificationService {

    private final IRedisOtpService otpService;
    private final IRedisRateLimitService rateLimitService;
    private final IRedisIdempotencyService idempotencyService;
    private final IEmailSender emailSender;

    @Override
    public void OtpNotificationHandler(OtpNotificationRequest request) {

        //IDENTITY CHECK
        if (idempotencyService.isProcessed(request.getId())) {
            return;
        }

        //RATE LIMIT CHECK
        if (!rateLimitService.isAllowed(request.getOtpRequest().email())) {
            log.warn("Rate limit hit for email {}", request.getOtpRequest().email());
            return; // NOT throw
        }

        if(!otpService.saveOtp(request.getOtpRequest().email(), request.getOtpRequest().otp())){
            throw new RuntimeException("Fail to save otp code with email: " + request.getOtpRequest().email());
        }

        //SEND EMAIL
        emailSender.sendOtpEmailAsync(request.getOtpRequest().email(), request.getOtpRequest().otp());

        //MARK AS PROCESSED
        idempotencyService.markProcessed(request.getId());
    }
}
