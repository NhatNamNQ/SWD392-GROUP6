# OrbitDocs — Cẩm Nang Toàn Diện Dự Án & Hướng Dẫn Cài Đặt (Project Guide & Setup Manual)

Chào mừng bạn đến với **OrbitDocs**, một nền tảng RAG (Retrieval-Augmented Generation) thông minh hỗ trợ sinh viên và giảng viên tương tác, tra cứu thông tin trực tiếp từ tài liệu bài giảng thông qua chatbot AI với hệ thống trích dẫn nguồn (citation) độ chính xác cao.

Tài liệu này cung cấp cái nhìn toàn cảnh về kiến trúc hệ thống, các luồng hoạt động chính và hướng dẫn chi tiết từng bước để cài đặt, cấu hình và vận hành dự án từ đầu.

---

## 🗺️ Bản đồ Tài liệu & Cấu trúc Thư mục

Dự án được tổ chức theo mô hình **Mono-repository** phân tách rõ ràng theo các tầng nghiệp vụ:

| Thư mục / Tập tin | Mô tả |
| :--- | :--- |
| `docs/` | Chứa tài liệu phân tích thiết kế, sơ đồ C4, User Stories và ADRs (Architecture Decision Records). |
| `OrbitDocs-backend/` | Mã nguồn **Java Spring Boot Backend** — quản lý thực thể, xác thực người dùng, lưu trữ siêu dữ liệu tài liệu. |
| `rag-backend/` | Mã nguồn **Python FastAPI RAG Service** — đảm nhận nhúng vector (embedding) với pgvector, kết nối Gemini LLM. |
| `frontend/` | Mã nguồn **Next.js Frontend & BFF (Backend-for-Frontend)** — giao diện trực quan cho Giảng viên & Sinh viên. |
| `infra/` | Tài liệu phục vụ hạ tầng, triển khai (IaC, Kubernetes, CI/CD). |
| `Makefile` | Tập hợp các lệnh tắt để tự động hóa khởi động Docker Compose và hạ tầng cục bộ. |

---

## 🏗️ Kiến Trúc Hệ Thống (System Architecture)

OrbitDocs áp dụng mô hình kiến trúc phân tầng (Microservices dạng thu nhỏ) để tối ưu hóa hiệu năng RAG và khả năng tích hợp linh hoạt:

```mermaid
flowchart TD
    User([Học viên / Giảng viên])
    
    subgraph ClientLayer["Client Layer (Trình duyệt)"]
        FE[Next.js Frontend App]
        BFF[Next.js BFF API Routes]
    end

    subgraph ServiceLayer["Services Layer (Nghiệp vụ)"]
        Java[Spring Boot Java Backend\nPort: 8080]
        Python[FastAPI Python RAG Service\nPort: 8000]
    end

    subgraph DataLayer["Data Layer (Cơ sở dữ liệu)"]
        DB[(PostgreSQL + pgvector\nPort: 5432)]
    end

    subgraph AI["External AI Engine"]
        Gemini[Gemini API - 1.5 Flash Lite]
    end

    User --> FE
    FE --> BFF
    BFF --> Java
    BFF --> Python
    Java --> DB
    Python --> DB
    Python --> Gemini
```

### Các thành phần cốt lõi:
1. **Next.js Frontend & BFF (Port 3000)**: 
   - Đảm nhận hiển thị giao diện giảng viên (quản lý tài liệu, xem danh sách phân đoạn/chunk, đối chiếu trang PDF) và giao diện sinh viên (khung chat RAG, popover xem nguồn trích dẫn).
   - Tầng **BFF** làm trung gian định tuyến bảo mật, xác thực Session Token dạng Cookie từ trình duyệt trước khi chuyển tiếp yêu cầu sang Java/Python.
2. **Spring Boot Java Backend (Port 8080)**:
   - Quản lý cơ sở dữ liệu quan hệ (Người dùng, Khóa học, Tài liệu học tập, các chương `Chapter`, thông tin phân đoạn `DocumentChunk`).
   - Cung cấp tài liệu Swagger UI phục vụ kiểm thử API độc lập.
3. **FastAPI Python RAG Service (Port 8000)**:
   - Chịu trách nhiệm thực hiện các tác vụ tính toán nặng: phân tách văn bản (Chunking), tạo vector nhúng (Embedding) thông qua Ollama cục bộ, và giao tiếp với Gemini LLM để tổng hợp câu trả lời dựa trên ngữ cảnh được truy xuất.
4. **PostgreSQL + pgvector**:
   - Lưu trữ dữ liệu quan hệ đồng thời hỗ trợ tìm kiếm khoảng cách Cosine trên vector nhúng hiệu năng cao.

---

## 🔄 Các Luồng Hoạt Động Đặc Trưng (Key Workflows)

### 1. Luồng Tải lên & Bóc tách Tài liệu (Upload Document & RAG Indexing Flow)

Luồng hoạt động này cho phép Giảng viên tải tài liệu học tập dạng PDF lên hệ thống để phân đoạn và nhúng vector tự động:

```mermaid
sequenceDiagram
    actor Lecturer as Giảng viên
    participant FE as Next.js Frontend
    participant BFF as Next.js BFF Proxy
    participant Java as Spring Boot Backend
    participant Python as Python RAG Service
    participant DB as PostgreSQL (pgvector)
    
    Lecturer->>FE: Kéo thả file PDF & chọn Khóa học
    FE->>BFF: POST /api/teacher/documents/upload (Multi-part Form)
    BFF->>Java: Forward request kèm JWT Token
    Note over Java: Xác thực Session & Lưu tệp tin vật lý vào thư mục uploads/
    Java->>DB: Insert Document (Trạng thái = PROCESSING)
    Java->>Python: POST /index (Async) {document_id, file_path}
    Note over Python: 1. Trích xuất text từ các trang PDF<br/>2. Phân đoạn văn bản thành các Chunk nhỏ<br/>3. Gọi Ollama (qwen3-embedding) tạo vector nhúng 768-dim
    Python->>DB: Save chunks & embeddings vào bảng document_chunks & chunk_embeddings
    Python-->>Java: Trả kết quả bóc tách thành công
    Java->>DB: Update Document (Trạng thái = INDEXED, chunk_count = N)
    loop Polling (Mỗi 2 giây)
        FE->>BFF: GET /api/teacher/courses/{id}/documents
        BFF->>Java: Forward request
        Java-->>FE: Danh sách tài liệu (Trạng thái tài liệu)
    end
    Note over FE: Khi thấy INDEXED: Chạy thanh tiến trình trượt nhanh tới 100% trong 2s,<br/>chuyển sang màu xanh lá báo thành công và dọn dẹp card upload.
```

* **Bước 1 (Gửi yêu cầu)**: Giảng viên chọn khóa học và kéo thả tệp PDF vào vùng tải lên tại màn hình Quản lý Tri thức (`knowledge-base-page.tsx`).
* **Bước 2 (Chuyển tiếp qua BFF)**: Next.js BFF nhận tập tin, kiểm tra session cookie, sau đó chuyển tiếp yêu cầu dưới dạng Multi-part Form tới Java Backend.
* **Bước 3 (Lưu trữ gốc)**: Java Backend lưu tập tin PDF vào thư mục vật lý cấu hình (`uploads/documents/`) và chèn một bản ghi mới vào bảng `documents` với trạng thái `PROCESSING`.
* **Bước 4 (Kích hoạt RAG ngầm)**: Java Backend gọi một HTTP POST bất đồng bộ tới Python RAG Service ở endpoint `/index`.
* **Bước 5 (Xử lý Vector hóa)**: Python RAG Service phân tích tài liệu PDF, phân chia văn bản thành các phân đoạn nhỏ (Chunking), gọi Ollama Local để tạo Vector nhúng cho mỗi phân đoạn, và chèn thông tin phân đoạn cùng vector nhúng vào database PostgreSQL (sử dụng phần mở rộng `pgvector`).
* **Bước 6 (Hoàn tất)**: Python phản hồi thành công, Java Backend cập nhật trạng thái tài liệu thành `INDEXED`. Đồng thời, Frontend (thông qua polling) phát hiện trạng thái thay đổi, chạy hiệu ứng trượt mượt mà lên 100% màu xanh lục trong 2 giây rồi hiển thị tài liệu tĩnh.

---

### 2. Luồng Học viên Hỏi & AI Chatbot phản hồi có Trích dẫn (Student Chat & RAG QA Flow)

Mô tả cách thức RAG tìm kiếm ngữ cảnh phù hợp từ tài liệu học tập để sinh câu trả lời kèm nguồn trích dẫn:

```mermaid
sequenceDiagram
    actor Student as Học viên
    participant FE as Next.js Frontend
    participant BFF as Next.js BFF Proxy
    participant Java as Spring Boot Backend
    participant Python as Python RAG Service
    participant DB as PostgreSQL (pgvector)
    participant Gemini as Gemini AI Engine
    
    Student->>FE: Gửi câu hỏi trong khung Chat
    FE->>BFF: POST /api/chats
    BFF->>Java: Forward request kèm Session JWT
    Java->>Python: POST /chat {query, course_id}
    Note over Python: 1. Vector hóa câu hỏi của sinh viên<br/>2. Thực hiện truy vấn khoảng cách Cosine trên pgvector
    Python->>DB: Query các chunk khớp nhất dựa trên Vector nhúng
    DB-->>Python: Trả về các chunk phù hợp & ID tương ứng
    Note over Python: Bọc câu hỏi và các nội dung chunk vào Prompt ngữ cảnh
    Python->>Gemini: Gửi Prompt yêu cầu sinh câu trả lời
    Gemini-->>Python: Trả về văn bản câu trả lời tổng hợp
    Python-->>Java: Trả về câu trả lời kèm mảng citations (chứa chunk_id, document_id, page_num)
    Note over Java: Liên kết các ID trích dẫn với các thực thể Document/Chunk trong DB
    Java->>DB: Save assistant message & message_citations
    Java-->>BFF: Trả về ChatResponse chứa câu trả lời & metadata trích dẫn
    BFF-->>FE: Trả về phản hồi JSON
    Note over FE: Hiển thị câu trả lời kèm nút trích dẫn [1], [2].<br/>Khi click, mở popover hiện rõ Tên tài liệu, Chương, Trang & số hiệu Chunk.
```

* **Bước 1 (Gửi câu hỏi)**: Sinh viên nhập câu hỏi vào khung chat bài học.
* **Bước 2 (Chuyển tiếp qua BFF)**: Next.js BFF xác thực quyền truy cập và chuyển tiếp yêu cầu đến Java Backend.
* **Bước 3 (Gửi yêu cầu RAG)**: Java Backend xác định khóa học, cấu hình thông số và gọi Python RAG Service.
* **Bước 4 (Tìm kiếm ngữ cảnh tương đồng)**: Python RAG hóa câu hỏi của sinh viên thành vector nhúng 768 chiều và thực hiện truy vấn SQL tìm kiếm khoảng cách Cosine trên PostgreSQL:
  ```sql
  SELECT doc_chunk, distance FROM document_chunks 
  ORDER BY embedding <=> query_embedding LIMIT 3;
  ```
* **Bước 5 (Gửi LLM)**: Sử dụng các khối văn bản của các chunk trả về làm ngữ cảnh (Context), Python tạo Prompt và gọi mô hình Gemini API để sinh câu trả lời chính xác dựa theo tài liệu gốc.
* **Bước 6 (Lưu trữ và Liên kết Trích dẫn)**: Python trả về câu trả lời cùng mảng thông tin trích dẫn (`citations`). Java Backend lưu tin nhắn và tạo các bản ghi `MessageCitation` liên kết khóa ngoại trực tiếp tới thực thể `Document` và `DocumentChunk` để đảm bảo dữ liệu toàn vẹn.
* **Bước 7 (Hiển thị)**: Câu trả lời được hiển thị dạng Markdown trên Frontend của sinh viên kèm các số hiệu trích dẫn. Khi click vào số hiệu này, popover hiển thị đầy đủ thông tin: tên tài liệu gốc, chương, trang và phân đoạn tương ứng.

---

### 3. Luồng Tạo Khóa Học & Phân Công Giảng Viên (Admin Course Creation & Lecturer Assignment Flow)

Luồng nghiệp vụ quản trị cho phép Quản trị viên khởi tạo khóa học và giao quyền quản lý tài liệu cho một Giảng viên xác định:

```mermaid
sequenceDiagram
    actor Admin as Quản trị viên
    participant FE as Next.js Frontend
    participant BFF as Next.js BFF Proxy
    participant Java as Spring Boot Backend
    participant DB as PostgreSQL
    
    Admin->>FE: Truy cập trang quản trị khóa học
    FE->>BFF: GET /api/admin/lecturers
    BFF->>Java: Forward request
    Java->>DB: Query các tài khoản có role = LECTURER
    DB-->>FE: Trả về danh sách giảng viên hiển thị trong dropdown
    Admin->>FE: Nhập tên khóa học, mã khóa học & chọn Giảng viên phụ trách
    FE->>BFF: POST /api/admin/courses (Payload chứa thông tin khóa học & lecturer_id)
    BFF->>Java: Forward request
    Note over Java: Xác thực quyền hạn ADMIN
    Java->>DB: Tìm kiếm Giảng viên & tạo mới Course liên kết
    Java-->>BFF: Trả về thông tin Course vừa tạo (201 Created)
    BFF-->>FE: Trả về phản hồi thành công
    Note over FE: Làm mới bảng danh sách khóa học và hiển thị thông báo thành công.
```

* **Bước 1 (Đọc dữ liệu Giảng viên)**: Khi Quản trị viên mở bảng điều khiển tạo khóa học, hệ thống tự động tải danh sách toàn bộ tài khoản Giảng viên khả dụng từ database thông qua BFF `/api/admin/lecturers`.
* **Bước 2 (Gửi yêu cầu tạo)**: Quản trị viên điền tên khóa học, mã khóa học, mô tả khóa học, chọn một giảng viên từ danh sách thả xuống và nhấn nút "Lưu".
* **Bước 3 (Thao tác DB tại Java)**: BFF gửi yêu cầu đến Java Backend. Java Backend (yêu cầu quyền hạn `ADMIN`) tìm thực thể `User` (lecturer) tương ứng với ID, khởi tạo đối tượng `Course` mới với mối quan hệ `ManyToOne` đến giảng viên đã chọn, và lưu bản ghi vào bảng `courses`.
* **Bước 4 (Cập nhật giao diện)**: Phản hồi thành công được trả về Frontend. Bảng danh sách khóa học tự động được cập nhật. Giảng viên được phân công giờ đây đã có quyền đăng nhập và quản trị kho tài liệu cho khóa học này.

---

## 🛠️ Hướng Dẫn Cài Đặt Chi Tiết (Step-by-Step Setup Guide)

### Yêu cầu hệ thống:
* **Hệ điều hành**: Windows 10/11, macOS hoặc Linux.
* **Docker & Docker Compose** (Để chạy PostgreSQL và Ollama).
* **JDK 21** và **Maven 3.9+** (Dành cho Java Backend).
* **Python 3.11+** và **pip** (Dành cho Python RAG Service).
* **Node.js 18+** và **npm** (Dành cho Frontend Next.js).

---

### Bước 1: Chuẩn bị tệp môi trường `.env`
Sao chép tập tin mẫu `.env.example` ở thư mục gốc của dự án thành `.env`:
```bash
cp .env.example .env
```
Mở tệp `.env` và điền khóa API Gemini của bạn:
```env
# PostgreSQL
POSTGRES_DB=orbitdocs_db
POSTGRES_USER=orbitdocs_admin
POSTGRES_PASSWORD=your_strong_password

# Java Backend (JDBC Connection)
DB_URL=jdbc:postgresql://localhost:5432/orbitdocs_db
DB_USERNAME=orbitdocs_admin
DB_PASSWORD=your_strong_password

# Python RAG Backend (SQLAlchemy Connection)
DATABASE_URL=postgresql://orbitdocs_admin:your_strong_password@localhost:5432/orbitdocs_db

# JWT & Session Configurations
JWT_SECRET=your-secret-key-min-32-characters-long
AUTH_SESSION_SECRET=dev-auth-session-secret-change-me

# Storage
UPLOAD_DIR=uploads/documents

# Service Endpoints
PYTHON_RAG_URL=http://localhost:8000
JAVA_BACKEND_URL=http://localhost:8080

# Gemini API Key (Bắt buộc phải điền để RAG Chatbot hoạt động)
GEMINI_API_KEY=AIzaSyD-xxxxxxxxxxxxxxxxxxxx
LLM_MODEL=gemini-1.5-flash-lite
```

---

### Bước 2: Khởi động cơ sở dữ liệu và Ollama
Chúng tôi cung cấp một `Makefile` ở thư mục gốc để rút ngắn các thao tác Docker.

Chạy lệnh sau tại thư mục gốc để khởi động PostgreSQL (hỗ trợ `pgvector`) và Ollama container:
```bash
make up
```
*(Nếu máy không cài đặt `make`, bạn có thể chạy trực tiếp lệnh: `docker compose up -d`)*

#### Thiết lập Model Embedding trong Ollama:
Chạy lệnh sau để tải model nhúng văn bản siêu nhẹ `qwen3-embedding:0.6b` vào Ollama:
```bash
docker exec -it orbitdocs-ollama ollama pull qwen3-embedding:0.6b
```
Kiểm tra model đã sẵn sàng chưa bằng lệnh:
```bash
docker exec -it orbitdocs-ollama ollama list
```

---

### Bước 3: Vận hành Java Backend (`OrbitDocs-backend`)
1. Di chuyển vào thư mục dự án:
   ```bash
   cd OrbitDocs-backend
   ```
2. Thực hiện tải thư viện và biên dịch dự án:
   ```bash
   mvn clean install -DskipTests
   ```
3. Khởi chạy ứng dụng Spring Boot:
   ```bash
   mvn spring-boot:run
   ```
   * Ứng dụng sẽ chạy tại địa chỉ: **http://localhost:8080**
   * Bạn có thể xem tài liệu mô tả các API RESTful tại: **http://localhost:8080/swagger-ui/index.html**

---

### Bước 4: Vận hành Python RAG Backend (`rag-backend`)
1. Mở một terminal mới và di chuyển vào thư mục RAG:
   ```bash
   cd rag-backend
   ```
2. Khởi tạo môi trường ảo Python (Virtual Environment):
   ```bash
   python -m venv venv
   ```
3. Kích hoạt môi trường ảo:
   - **Trên Windows**:
     ```bash
     venv\Scripts\activate
     ```
   - **Trên macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```
4. Cài đặt các thư viện cần thiết:
   ```bash
   pip install -r requirements.txt
   ```
5. Khởi chạy RAG server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   * RAG Service sẽ lắng nghe tại cổng: **http://localhost:8000**
   * Bạn có thể truy cập tài liệu kiểm thử tự động tại: **http://localhost:8000/docs**

---

### Bước 5: Vận hành Frontend & BFF (`frontend`)
1. Mở terminal mới và chuyển tới thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói thư viện Node.js:
   ```bash
   npm install
   ```
3. Khởi chạy server phát triển (Development Server):
   ```bash
   npm run dev
   ```
   * Ứng dụng Web sẽ hoạt động tại địa chỉ: **http://localhost:3000**
   * Trang Đăng nhập mặc định cho Giảng viên & Sinh viên sẽ hiển thị tại đây.

---

## ⚡ Các lệnh kiểm tra chất lượng (Verification Commands)

Trước khi gửi các thay đổi (commit/PR), bạn nên chạy các lệnh kiểm tra tiêu chuẩn sau để đảm bảo chất lượng code không có lỗi logic/kiểu dữ liệu tĩnh:

* **Đối với Frontend**:
  ```bash
  npm --prefix frontend run precheck
  ```
  *(Lệnh này tự động thực thi sinh kiểu route type của Next.js, quét lỗi Lint bằng ESLint, và kiểm tra tính nhất quán kiểu dữ liệu TypeScript).*

* **Đối với Java Backend**:
  ```bash
  cd OrbitDocs-backend
  mvn clean compile
  ```

Chúc bạn có những trải nghiệm làm việc tuyệt vời cùng OrbitDocs! Nếu gặp bất kỳ vấn đề gì trong quá trình setup, vui lòng kiểm tra lại trạng thái kết nối cơ sở dữ liệu hoặc nhật ký log của Docker Container.
