package swd392.project.orbitdocsbackend.identity.exception.user;

import org.springframework.http.HttpStatus;
import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class UserExistException extends UserException {
    public UserExistException() {
        super(ErrorCode.USER_NOT_FOUND);
    }
}
