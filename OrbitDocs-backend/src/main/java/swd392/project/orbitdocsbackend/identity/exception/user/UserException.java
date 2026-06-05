package swd392.project.orbitdocsbackend.identity.exception.user;

import swd392.project.orbitdocsbackend.shared.exception.AppException;
import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class UserException extends AppException {

    public UserException(ErrorCode errorCode) {
        super(errorCode);
    }
}
