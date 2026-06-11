package swd392.project.orbitdocsbackend.identity.exception.auth;


import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class EmailNotFoundException extends AuthException {
    public EmailNotFoundException() {
        super(ErrorCode.EMAIL_NOT_FOUND);
    }
}
