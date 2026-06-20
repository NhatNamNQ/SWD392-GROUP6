package swd392.project.orbitdocsbackend.shared.exception;

import io.jsonwebtoken.JwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import swd392.project.orbitdocsbackend.identity.exception.auth.RequirePasswordChangeException;
import swd392.project.orbitdocsbackend.shared.response.ApiResponse;

import java.util.HashMap;
import java.util.Map;
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

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                ApiResponse.error(ErrorCode.UNAUTHORIZED.getStatusCode(), ErrorCode.UNAUTHORIZED.getMessage())
        );
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ApiResponse.error(ErrorCode.UNAUTHENTICATED.getStatusCode(), ErrorCode.UNAUTHENTICATED.getMessage())
        );
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ApiResponse<Void>> handleJwtException(JwtException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ApiResponse.error(ErrorCode.TOKEN_INVALID.getStatusCode(), ex.getMessage())
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

    @ExceptionHandler(RequirePasswordChangeException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleRequirePasswordChange(RequirePasswordChangeException ex) {

        Map<String, Object> data = new HashMap<>();
        data.put("tempToken", ex.getTempToken());
        data.put("errorCode", "REQUIRE_PASSWORD_CHANGE");

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                ApiResponse.<Map<String, Object>>builder()
                        .status(ErrorCode.REQUIRE_PASSWORD_CHANGE.getStatusCode())
                        .message(ex.getMessage())
                        .data(data)
                        .build()
        );
    }
}
