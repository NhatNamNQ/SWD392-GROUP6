package swd392.project.orbitdocsbackend.identity.exception.token;


import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class TokenRevokedException extends swd392.project.orbitdocsbackend.identity.exceptions.token.TokenException {
    public TokenRevokedException() {
        super(ErrorCode.TOKEN_REVOKED);
    }
}
