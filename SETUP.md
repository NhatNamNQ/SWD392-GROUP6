# OrbitDocs — Hướng dẫn cài đặt & chạy Backend

## Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu | Ghi chú |
|---------|---------------------|---------|
| Docker | 24+ | Chạy PostgreSQL, Ollama |
| Docker Compose | v2+ | Đi kèm Docker Desktop |
| Java | 17+ | Chạy Java Backend |
| Maven | 3.9+ | Build Java Backend |
| Python | 3.11+ | Chạy RAG Backend |
| Git | 2.x | |

---

## 1. Clone & cấu hình `.env`

```bash
git clone https://github.com/NhatNamNQ/SWD392-GROUP6.git
cd SWD392-GROUP6
cp .env.example .env
```

Mở file `.env` và sửa các giá trị cho phù hợp:

```env
# PostgreSQL
POSTGRES_DB=orbitdocs_db
POSTGRES_USER=orbitdocs_admin
POSTGRES_PASSWORD=your_strong_password

# Java Backend (JDBC)
DB_URL=jdbc:postgresql://localhost:5432/orbitdocs_db
DB_USERNAME=orbitdocs_admin
DB_PASSWORD=your_strong_password

# Python RAG Backend (SQLAlchemy)
DATABASE_URL=postgresql://orbitdocs_admin:your_strong_password@localhost:5432/orbitdocs_db

# JWT
JWT_SECRET=your-secret-key-min-32-characters-long

# Storage
UPLOAD_DIR=uploads/documents

# Service URLs
PYTHON_RAG_URL=http://localhost:8000
JAVA_BACKEND_URL=http://localhost:8080

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
EMBEDDING_MODEL=qwen3-embedding:0.6b

# Gemini API Key (lấy tại https://aistudio.google.com/apikey)
GEMINI_API_KEY=your-gemini-api-key
LLM_MODEL=gemini-3.1-flash-lite
```

> **Lưu ý:** File `.env` chứa secrets — **không commit** lên Git. Dùng `.env.example` làm template.

---

## 2. Khởi động hạ tầng bằng Docker

```bash
# Chạy PostgreSQL + Ollama
docker compose up -d

# Kiểm tra trạng thái
docker compose ps
```

Kết quả mong đợi:
```
NAME                  STATUS
orbitdocs-postgres    running (healthy)
orbitdocs-ollama      running
```

### Pull Embedding Model

```bash
# Pull model embedding vào Ollama container
docker exec -it orbitdocs-ollama ollama pull qwen3-embedding:0.6b

# Kiểm tra
docker exec -it orbitdocs-ollama ollama list
```

---

## 3. Chạy Java Backend (`OrbitDocs-backend`)

```bash
cd OrbitDocs-backend

# Build
mvn clean install -DskipTests

# Chạy
mvn spring-boot:run
```

Server chạy tại: **http://localhost:8080**

| Endpoint | URL |
|----------|-----|
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Health check | http://localhost:8080/actuator/health |
| API docs | http://localhost:8080/api-docs |

---

## 4. Chạy Python RAG Backend (`rag-backend`)

```bash
cd rag-backend

# Tạo virtual environment
python -m venv venv

# Kích hoạt (Windows)
venv\Scripts\activate

# Kích hoạt (macOS/Linux)
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt
pip install langchain-ollama

# Chạy server
uvicorn main:app --reload --port 8000
```

Server chạy tại: **http://localhost:8000**

| Endpoint | URL |
|----------|-----|
| API docs | http://localhost:8000/docs |

---

## 5. Thứ tự khởi động

```
1. docker compose up -d          → PostgreSQL (5432) + Ollama (11434)
2. ollama pull qwen3-embedding   → Pull model (chỉ cần lần đầu)
3. Java Backend                  → Port 8080
4. Python RAG Backend            → Port 8000
```

---

## 6. Dừng hạ tầng

```bash
# Dừng tất cả containers
docker compose down

# Dừng và xóa data (reset DB)
docker compose down -v
```

---

## 7. Test nhanh luồng Upload + Chat

### Upload tài liệu

```
POST http://localhost:8080/api/documents/upload
Content-Type: multipart/form-data

Body (form-data):
  - courseId: <UUID của course>  (lấy từ DB bảng courses)
  - file: <chọn file PDF, tối đa 8MB>
```

### Chat với tài liệu

```
POST http://localhost:8000/api/chat
Content-Type: application/json

{
    "document_id": "<UUID của document>",
    "query": "Tài liệu này nói về chủ đề gì?",
    "top_k": 5
}
```

---

## 8. Cấu trúc thư mục

```
SWD392-GROUP6/
├── .env.example                  # Template biến môi trường
├── docker-compose.yml            # PostgreSQL + Ollama
├── OrbitDocs-backend/            # Java Spring Boot Backend
│   ├── src/main/java/.../
│   │   ├── document/             # Module quản lý tài liệu
│   │   ├── identity/             # Module xác thực (JWT)
│   │   ├── course/               # Module khóa học
│   │   └── shared/               # Config, exception, response chung
│   └── pom.xml
└── rag-backend/                  # Python FastAPI RAG Backend
    ├── core/                     # Config & database connection
    ├── models/                   # SQLAlchemy models
    ├── routers/                  # API endpoints (indexer, chat)
    ├── services/                 # Business logic
    ├── main.py                   # FastAPI entry point
    └── requirements.txt
```
