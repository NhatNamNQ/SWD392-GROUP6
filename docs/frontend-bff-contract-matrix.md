# Frontend/BFF Contract Matrix

## Purpose
- Track which FE/BFF routes already match the current Java backend contract.
- Separate `aligned`, `aligned with caveat`, and `blocked by backend` states before changing more code.

## Auth
| FE/BFF route | Java route | State | Notes |
| --- | --- | --- | --- |
| `POST /api/auth/login` | `POST /api/auth/login` | `aligned with caveat` | Success path uses `ApiResponse<AuthResponse>`. If BE returns password-change `403` without `tempToken`, FE surfaces the backend error directly and does not continue to force-change-password. |
| `POST /api/auth/refresh` | `POST /api/auth/refresh` | `aligned` | BFF reads auth envelope and mirrors refresh cookie. |
| `POST /api/auth/logout` | `POST /api/auth/logout` | `aligned` | BFF forwards refresh cookie and clears FE cookies. |
| `POST /api/auth/force-change-password` | `POST /api/auth/force-change-password` | `blocked by backend` | FE route is wired and covered, but the login prerequisite is blocked when BE omits `tempToken`. |
| `POST /api/auth/register` | `POST /api/auth/register` | `aligned` | BFF reads success/error payloads from current envelope shape. |
| `POST /api/auth/forgot-password` | `POST /api/auth/forgot-password` | `aligned` | BFF maps `{ email, expireIn, message }` from BE envelope. |
| `POST /api/auth/resend-otp` | `POST /api/auth/resend-otp` | `aligned` | Same mapping strategy as forgot-password. |
| `POST /api/auth/confirm-otp` | `POST /api/auth/confirm-otp` | `aligned` | BFF passes envelope data through to FE auth flow. |
| `POST /api/auth/reset-password` | `POST /api/auth/reset-password` | `aligned` | BFF normalizes envelope message for FE. |
| `POST /api/auth/change-password` | `PATCH /api/users/change-password` | `aligned` | BFF signs request with FE session and sends `{ id, oldPassword, newPassword }`. |

## Admin and Identity
| FE/BFF route | Java route | State | Notes |
| --- | --- | --- | --- |
| `GET/POST/PATCH /api/admin/users` | `GET/POST/PATCH /api/users` | `aligned` | Shared Java proxy unwraps `ResponseEntity<UserResponse | List<UserResponse>>`. |
| `GET/DELETE /api/admin/users/[id]` | `GET/DELETE /api/users/{id}` | `aligned` | Delete path expects `204` / empty body handling via Java proxy error wrapper. |
| `GET/POST /api/admin/roles` | `GET/POST /api/roles` | `aligned` | Create route intentionally returns `201` from BFF. |
| `GET/PATCH/DELETE /api/admin/roles/[id]` | `GET/PATCH/DELETE /api/roles/{id}` | `aligned` | Proxy layer handles Java responses directly. |
| `POST /api/admin/lecturers` | `POST /api/admin/lecturers` | `aligned` | Route is BE-specific and does not require extra FE mapping. |

## Courses
| FE/BFF route | Java route | State | Notes |
| --- | --- | --- | --- |
| `GET/POST /api/admin/courses` | `GET/POST /api/v1/courses` | `aligned` | Course DTO shape matches current Java `CourseResponse`. |
| `POST /api/admin/courses/search` | `POST /api/v1/courses/search` | `aligned` | Query params are built from FE payload defaults. |
| `GET/PUT /api/admin/courses/[courseId]` | `GET/PUT /api/v1/courses/{id}` | `aligned` | Uses shared Java proxy and current field names. |

## Documents
| FE/BFF route | Java route | State | Notes |
| --- | --- | --- | --- |
| `POST /api/teacher/documents/upload` | `POST /api/documents/upload` | `aligned with caveat` | Upload proxy is correct for Java; BFF now blocks non-lecturers before forwarding, and downstream indexing still depends on Python RAG runtime. |
| `GET /api/teacher/courses/[courseId]/documents` | `GET /api/documents/course/{courseId}` | `aligned` | Read-only list path matches current BE route. |
| `GET/DELETE /api/teacher/documents/[id]` | `GET/DELETE /api/documents/{id}` | `aligned` | Proxy shape matches current document responses. |
| `GET /api/teacher/documents/[id]/chapters` | `GET /api/documents/{documentId}/chapters` | `aligned` | FE chapter DTO matches current Java `ChapterResponse`. |

## Chat
| FE/BFF route | Java route | State | Notes |
| --- | --- | --- | --- |
| `GET /api/chat/bootstrap` | composite | `aligned with caveat` | Bootstrap wiring is correct, but live chat readiness still depends on RAG runtime. |
| `POST /api/chats` | `POST /api/chats` | `aligned with caveat` | Java route is correct; actual answer generation depends on Python + embedding runtime. |
| `GET /api/chats/sessions` | `GET /api/chats/sessions` | `aligned` | Session DTO shape matches current Java controller. |
| `GET /api/chats/sessions/[sessionId]` | `GET /api/chats/sessions/{sessionId}` | `aligned` | Detail DTO is proxied through the BFF, which normalizes Java `USER`/`ASSISTANT` enum values to the FE `user`/`assistant` contract. |

## Internal RAG
| Route | State | Notes |
| --- | --- | --- |
| `POST /api/internal/rag/chapters/sync` | `not in FE scope` | Java/Python internal callback, no FE/BFF route should proxy this. |
| `POST /api/internal/rag/failed` | `not in FE scope` | Java/Python internal callback, tracked as backend/runtime integration only. |
