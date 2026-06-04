package swd392.project.orbitdocsbackend.identity.exceptions.auth;


import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class WrongPasswordException extends AuthException {
    public WrongPasswordException() {
        super(ErrorCode.WRONG_PASSWORD);
    }
}
