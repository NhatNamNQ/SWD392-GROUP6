package swd392.project.orbitdocsbackend.identity.exceptions.token;

import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class TokenExpiredException extends TokenException {
    public TokenExpiredException() {
        super(ErrorCode.TOKEN_EXPIRED);
    }
}
