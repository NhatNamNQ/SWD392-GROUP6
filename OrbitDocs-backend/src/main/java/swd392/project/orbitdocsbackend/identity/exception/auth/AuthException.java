package swd392.project.orbitdocsbackend.identity.exception.auth;

import org.springframework.http.HttpStatus;
import swd392.project.orbitdocsbackend.shared.exception.AppException;
import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class AuthException extends AppException {

    public AuthException(ErrorCode errorCode) {
        super(errorCode);
    }
}
