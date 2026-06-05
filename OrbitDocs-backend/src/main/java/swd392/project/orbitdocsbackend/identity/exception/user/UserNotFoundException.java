package swd392.project.orbitdocsbackend.identity.exception.user;


import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

public class UserNotFoundException extends UserException {
    public UserNotFoundException() {
        super(ErrorCode.USER_NOT_FOUND);
    }
}
