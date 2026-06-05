package swd392.project.orbitdocsbackend.identity.exception.token;


import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class InvalidTokenException extends swd392.project.orbitdocsbackend.identity.exceptions.token.TokenException {
    public InvalidTokenException() {
        super(ErrorCode.TOKEN_INVALID);
    }
}
