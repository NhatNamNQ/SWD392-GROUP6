package swd392.project.orbitdocsbackend.identity.exception.auth.otp;


import swd392.project.orbitdocsbackend.identity.exception.auth.AuthException;
import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class OtpRateLimitException extends AuthException {
    public OtpRateLimitException() {
        super(ErrorCode.OTP_RATE_LIMIT_EXCEEDED);
    }
}
