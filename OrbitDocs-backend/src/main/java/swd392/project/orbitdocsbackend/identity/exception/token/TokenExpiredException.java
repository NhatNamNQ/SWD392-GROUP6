package swd392.project.orbitdocsbackend.identity.exception.token;

import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;
import swd392.project.orbitdocsbackend.identity.exceptions.token.TokenException;

public class TokenExpiredException extends TokenException {
    public TokenExpiredException() {
        super(ErrorCode.TOKEN_EXPIRED);
    }
}
