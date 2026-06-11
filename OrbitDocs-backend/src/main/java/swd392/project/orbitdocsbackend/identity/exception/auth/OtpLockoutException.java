package swd392.project.orbitdocsbackend.identity.exception.auth;


import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class OtpLockoutException extends AuthException {
    private final long lockoutRemainingSeconds;

    public OtpLockoutException(long lockoutRemainingSeconds) {
        super(ErrorCode.TOO_MANY_FAILED_ATTEMPTS);
        this.lockoutRemainingSeconds = lockoutRemainingSeconds;
    }

    public long getLockoutRemainingSeconds() {
        return lockoutRemainingSeconds;
    }
}
