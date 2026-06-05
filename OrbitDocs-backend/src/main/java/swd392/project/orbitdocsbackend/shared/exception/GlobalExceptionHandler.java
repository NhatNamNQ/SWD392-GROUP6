package swd392.project.orbitdocsbackend.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import swd392.project.orbitdocsbackend.shared.response.ApiResponse;

import java.util.Objects;

@ControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<ApiResponse<Void>> handlingRuntimeException(Exception exception) {
        log.error("Exception: ", exception);
        return ResponseEntity.internalServerError().body(
                ApiResponse.error(ErrorCode.UNCATEGORIZED_EXCEPTION.getStatusCode(), ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage())
        );
    }

    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<ApiResponse<Void>> handlingAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        return ResponseEntity.status(errorCode.getStatusCode()).body(
                ApiResponse.error(errorCode.getStatusCode(), errorCode.getMessage())
        );
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handlingValidation(MethodArgumentNotValidException exception) {
        String enumKey = Objects.requireNonNull(exception.getFieldError()).getDefaultMessage();
        
        ErrorCode errorCode = ErrorCode.INVALID_KEY;
        try {
            errorCode = ErrorCode.valueOf(enumKey);
        } catch (IllegalArgumentException e) {
            log.error("Validation key {} is not found in ErrorCode", enumKey);
        }

        return ResponseEntity.badRequest().body(
                ApiResponse.error(errorCode.getStatusCode(), errorCode.getMessage())
        );
    }
    @ExceptionHandler(MissingRequestCookieException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingCookie(
            MissingRequestCookieException ex) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(
                        ApiResponse.error(
                                ErrorCode.MISSING_COOKIE.getStatusCode(),
                                ErrorCode.MISSING_COOKIE.getMessage()
                        )
                );
    }
}
