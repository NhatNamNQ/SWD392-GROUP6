package swd392.project.orbitdocsbackend.identity.exception.auth;


import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class WrongOtpCodeException extends AuthException {
    public WrongOtpCodeException() {
        super(ErrorCode.WRONG_OTP_CODE);
    }
}
