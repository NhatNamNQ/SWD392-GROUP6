package swd392.project.orbitdocsbackend.identity.exception.token;

import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class TokenExpiredException extends swd392.project.orbitdocsbackend.identity.exceptions.token.TokenException {
    public TokenExpiredException() {
        super(ErrorCode.TOKEN_EXPIRED);
    }
}
