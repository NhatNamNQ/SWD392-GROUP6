package swd392.project.orbitdocsbackend.identity.exception.auth;


import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class OtpExpiredException extends AuthException {
    public OtpExpiredException() {
        super(ErrorCode.OTP_EXPIRED);
    }
}
