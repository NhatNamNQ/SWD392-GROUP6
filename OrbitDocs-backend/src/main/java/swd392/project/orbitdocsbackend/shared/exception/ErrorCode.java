package swd392.project.orbitdocsbackend.shared.exception;
import lombok.Getter;

@Getter
public enum ErrorCode {

    // Token
    TOKEN_EXPIRED(401, "Token expired"),
    TOKEN_INVALID(401, "Token invalid"),
    TOKEN_REVOKED(401, "Token revoked"),
    MISSING_COOKIE(401, "Missing cookie"),

    //Redis
    REDIS_DATA_NOT_FOUND(404, "Redis data not found"),
    OTP_SAVE_FAILED (401 ,"OTP_SAVE_FAILED"),
    OTP_DELETE_FAILED (401 ,"OTP_DELETE_FAILED"),
    OTP_RATE_LIMIT_EXCEEDED (401 ,"OTP_RATE_LIMIT_EXCEEDED"),
    tp_Expired (401, "OTP_EXPIRED"),

    // Auth
    EMAIL_NOT_FOUND(404, "Email not found"),
    EMAIL_ALREADY_REGISTERED(400, "Email already registered"),
    WRONG_PASSWORD(400, "Wrong password"),
    WRONG_OTP_CODE(400, "Wrong OTP code"),
    OTP_EXPIRED(400, "OTP expired"),
    TOO_MANY_FAILED_ATTEMPTS(429, "Too many failed attempts"),
    PENDING_USER_NOT_FOUND(404, "Pending user not found"),

    // User
    USER_NOT_FOUND(404, "User not found"),
    USER_ALREADY_REGISTERED(400, "User already registered"),
    USER_INACTIVE(403, "User is inactive"),

    // Role
    ROLE_NOT_FOUND(404, "Role not found"),

    // Common
    UNCATEGORIZED_EXCEPTION(500, "Uncategorized error"),
    INVALID_KEY(500, "Invalid message key"),
    UNAUTHENTICATED(401, "Unauthenticated"),
    UNAUTHORIZED(403, "You do not have permission"),

    // Document
    DOCUMENT_NOT_FOUND(404, "Document not found"),
    COURSE_NOT_FOUND(404, "Course not found"),
    INVALID_FILE_TYPE(400, "Only PDF files are supported"),
    FILE_STORAGE_FAILED(500, "Failed to store file"),
    INDEXING_JOB_NOT_FOUND(404, "Indexing job not found");


    private final int statusCode;
    private final String message;

    ErrorCode(int statusCode, String message) {
        this.statusCode = statusCode;
        this.message = message;
    }
}
