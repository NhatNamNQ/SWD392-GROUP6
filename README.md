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

## 🛠️ Hướng Dẫn Cài Đặt Chi Tiết (Step-by-Step Setup Guide)

### Yêu cầu hệ thống

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

#### Thiết lập Model Embedding trong Ollama

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

   * Ứng dụng sẽ chạy tại địa chỉ: **<http://localhost:8080>**
   * Bạn có thể xem tài liệu mô tả các API RESTful tại: **<http://localhost:8080/swagger-ui/index.html>**

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
   * **Trên Windows**:

     ```bash
     venv\Scripts\activate
     ```

   * **Trên macOS / Linux**:

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

   * RAG Service sẽ lắng nghe tại cổng: **<http://localhost:8000>**
   * Bạn có thể truy cập tài liệu kiểm thử tự động tại: **<http://localhost:8000/docs>**

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

   * Ứng dụng Web sẽ hoạt động tại địa chỉ: **<http://localhost:3000>**
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
