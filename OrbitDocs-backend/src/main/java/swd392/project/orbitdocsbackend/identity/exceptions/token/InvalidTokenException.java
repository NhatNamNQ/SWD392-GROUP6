package swd392.project.orbitdocsbackend.identity.exceptions.token;


import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class InvalidTokenException extends TokenException {
    public InvalidTokenException() {
        super(ErrorCode.TOKEN_INVALID);
    }
}
