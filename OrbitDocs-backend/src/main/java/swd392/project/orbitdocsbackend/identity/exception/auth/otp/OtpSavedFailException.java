package swd392.project.orbitdocsbackend.identity.exception.auth.otp;


import swd392.project.orbitdocsbackend.identity.exception.auth.AuthException;
import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class OtpSavedFailException extends AuthException {
    public OtpSavedFailException() {
        super(ErrorCode.OTP_SAVE_FAILED);
    }
}
