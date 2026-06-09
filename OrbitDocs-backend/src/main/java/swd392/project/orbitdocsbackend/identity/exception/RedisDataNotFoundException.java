package swd392.project.orbitdocsbackend.identity.exception;

import org.springframework.http.HttpStatus;
import swd392.project.orbitdocsbackend.shared.exception.AppException;
import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;


public class RedisDataNotFoundException extends AppException {

    public RedisDataNotFoundException() {
        super(ErrorCode.REDIS_DATA_NOT_FOUND);
    }
}
