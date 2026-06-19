# OrbitDocs Backend API Specification

This document provides a comprehensive overview of the APIs and key workflows available in the `OrbitDocs-backend`.

## 1. Core API Endpoints

Responses are typically wrapped in an `ApiResponse<T>` wrapper:
```json
{
  "data": { ... },
  "message": "Success message",
  "success": true
}
```

### 1.1. Identity Domain

#### User Authentication (`/api/auth`)
- **`POST /register`**
  - Request: `RegisterRequest` (email, fullName, password)
  - Workflow: Creates a pending user in Redis and sends an OTP via email to confirm registration.
- **`POST /confirm-otp`**
  - Request: `ConfirmOtpRequest` (email, otp, type)
  - Workflow: Validates OTP. If `type == REGISTER`, creates the `User` with `STUDENT` role. If `type == FORGET_PASSWORD`, generates a `resetToken`.
- **`POST /login`**
  - Request: `LoginRequest` (email, password)
  - Response: `AuthResponse` (user info, access token, refresh token)
  - Workflow: Validates credentials. If `isPasswordChanged` is false, it throws a `RequirePasswordChangeException` and prevents normal login, returning a temporary token.
- **`POST /force-change-password`**
  - Request: `ForceChangePasswordRequest` (newPassword, confirmPassword)
  - Response: `AuthResponse` (user info, access token, refresh token)
  - Workflow: Sets the new password, updates `isPasswordChanged` to `true`, and generates valid auth tokens.
- **`POST /forgot-password`**
  - Request: `ForgetPasswordRequest` (email)
  - Response: `EmailActionResponse`
- **`POST /reset-password`**
  - Request: `ResetPasswordRequest` (resetToken, newPassword, confirmPassword)
- **`POST /refresh`**
  - Request: Refresh token (from Cookie)
  - Response: `AuthResponse`
- **`POST /logout`**
  - Invalidates tokens in Redis and clears cookies.

#### Admin Management (`/api/admin`)
- **`POST /lecturers`**
  - Requires: `ADMIN` Role
  - Request: `CreateLecturerRequest` (email, fullName)
  - Response: `UserResponse`
  - Workflow: *See Key Workflows section.*

#### User Management (`/api/users`)
- **`POST /`**: Create a user (Admin).
- **`GET /{id}`**: Get user by ID.
- **`GET /`**: Get all users.
- **`PATCH /`**: Update user information.
- **`PATCH /change-password`**: Update password.
- **`DELETE /{id}`**: Delete user.

#### Role Management (`/api/roles`)
- Standard CRUD for roles: `POST /`, `GET /`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}`.

### 1.2. Document Domain

#### Document Management (`/api/documents`)
- **`POST /upload`**
  - Content-Type: `multipart/form-data`
  - Request: `courseId`, `file` (PDF)
  - Response: `DocumentResponse`
  - Notes: Only the assigned lecturer of the course can upload documents. If a document with the same filename already exists in the course, it is overwritten. Triggers asynchronous RAG indexing.
- **`GET /course/{courseId}`**: List all documents for a specific course.
- **`GET /{id}`**: Get document by ID.
- **`DELETE /{id}`**: Delete document from DB and storage.
- **`GET /{documentId}/chapters`**: Get all processed chapters for a specific document.

#### RAG Internal Webhook (`/api/internal/rag`)
- **`POST /chapters/sync`**
  - Request: `ChapterSyncRequest` (documentId, chapters[], chunkCount, jobId)
  - Workflow: *See Key Workflows section.*
- **`POST /failed`**
  - Request: `RagFailureRequest` (documentId, reason)
  - Workflow: Marks indexing job as failed.

### 1.3. Course Domain (`/api/v1/courses`)
- **`POST /`**
  - Request: `CourseRequest` (code, name, description, lecturerId)
  - Response: `CourseResponse`
- **`GET /`**: List all courses.
- **`POST /search`**: Search courses by code (paginated via `pageNo`, `pageSize`).
- **`GET /{id}`**: Get course by ID.
- **`PUT /{id}`**: Update course details.

### 1.4. Chat Domain (`/api/chats`)
- **`POST /`**
  - Request: `ChatRequest` (query, courseId, sessionId, documentId, chapterId)
  - Response: `ChatResponse`
  - Workflow: *See Key Workflows section.*
- **`GET /sessions`**: List user's past chat sessions.
- **`GET /sessions/{sessionId}`**: Get full chat history (messages + citations) for a specific session.

---

## 2. Key Workflows

### 2.1. Lecturer Onboarding & Forced Password Change
1. **Creation**: Admin calls `POST /api/admin/lecturers` with the lecturer's email and name.
2. **Setup**: The backend generates an 8-character random password. It creates the User with the `LECTURER` role, sets `active = true`, and crucially, sets `passwordChanged = false`.
3. **Notification**: The system asynchronously sends an email containing the generated credentials to the lecturer.
4. **First Login Attempt**: The lecturer attempts to log in via `POST /api/auth/login`.
5. **Rejection & Prompt**: `AuthService` validates the password but checks `!user.isPasswordChanged()`. It throws a `RequirePasswordChangeException` and returns a temporary token to the client.
6. **Force Change**: The client prompts the user to change their password and calls `POST /api/auth/force-change-password` with the temporary token.
7. **Completion**: The backend updates the password, sets `passwordChanged = true`, and returns valid access and refresh tokens.

### 2.2. Document Upload & RAG Sync Workflow
1. **Upload Initiation**: A lecturer calls `POST /api/documents/upload`.
2. **Validation**: The backend verifies the user is the course lecturer and the file is a PDF. If the file is an update to an existing document, the old file is deleted from S3-compatible storage.
3. **Storage & DB**: The file is uploaded to storage. The `Document` entity is saved with `status = UPLOADED`.
4. **Trigger Indexing**: `RagIntegrationService` creates an `IndexingJob` (status `PROCESSING`) and sends a request to the Python RAG backend to start processing the document.
5. **Asynchronous Processing**: The Python service processes, chunks, and vectorizes the document.
6. **Webhook Callback**: Upon completion, the Python service calls `POST /api/internal/rag/chapters/sync` with the extracted chapters and chunk counts.
7. **Finalization**: `ChapterService` clears old chapters, saves the new ones, marks the Document status as `INDEXED` (with the total chunk count), and marks the `IndexingJob` as `INDEXED`.

### 2.3. AI Chat Interaction Workflow
1. **Session Context**: The user calls `POST /api/chats`. The system creates a `ChatSession` if `sessionId` is null, locking it to a specific `Course` and optionally a `Document` or `Chapter`.
2. **Access Control**: The backend ensures the requested Document actually belongs to the associated Course.
3. **User Message**: The user's query is saved to the DB as a `ChatMessage`.
4. **RAG Integration**: A `RagChatRequest` is sent to the internal Python RAG service (`/api/chat`), passing the query, `document_id`, and `chapter_title`.
5. **AI Response & Citations**: The Python service returns an answer and a list of citations (chunks and page numbers).
6. **Save & Return**: The assistant's message and the associated `MessageCitation`s are saved to the database. The `ChatResponse` is returned to the client, including citation details.
