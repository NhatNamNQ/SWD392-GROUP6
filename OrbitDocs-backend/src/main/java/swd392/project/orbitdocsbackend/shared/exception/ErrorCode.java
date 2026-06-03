package swd392.project.orbitdocsbackend.shared.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(500, "Uncategorized error"),
    INVALID_KEY(500, "Invalid message key"),
    USER_EXISTED(400, "User already existed"),
    USER_NOT_FOUND(404, "User not found"),
    UNAUTHENTICATED(401, "Unauthenticated"),
    UNAUTHORIZED(403, "You do not have permission"),
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
