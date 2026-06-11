package swd392.project.orbitdocsbackend.identity.exception.auth;

import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class RequirePasswordChangeException extends AuthException {
    private final String tempToken;

    public RequirePasswordChangeException(String tempToken) {
        super(ErrorCode.REQUIRE_PASSWORD_CHANGE);
        this.tempToken = tempToken;
    }

    public String getTempToken() {
        return tempToken;
    }
}
