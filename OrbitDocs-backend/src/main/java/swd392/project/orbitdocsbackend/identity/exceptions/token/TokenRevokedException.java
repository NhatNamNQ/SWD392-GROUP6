package swd392.project.orbitdocsbackend.identity.exceptions.token;


import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class TokenRevokedException extends TokenException {
    public TokenRevokedException() {
        super(ErrorCode.TOKEN_REVOKED);
    }
}
