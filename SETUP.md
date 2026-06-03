# OrbitDocs — Hướng dẫn cài đặt & chạy Backend

## Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---------|---------------------|
| Java | 17+ |
| Maven | 3.9+ |
| Python | 3.11+ |
| PostgreSQL | 15+ (có extension `pgvector`) |
| Ollama | latest |
| Git | 2.x |

---

## 1. Cài đặt PostgreSQL + pgvector

```bash
# Tạo database
psql -U postgres
CREATE USER orbitdocs_admin WITH PASSWORD 'orbitdocs_password';
CREATE DATABASE orbitdocs_db OWNER orbitdocs_admin;
\c orbitdocs_db
CREATE EXTENSION IF NOT EXISTS vector;
\q
```

> **Lưu ý:** Nếu dùng Docker thì chạy image `pgvector/pgvector:pg16` để có sẵn extension.

---

## 2. Cài đặt Ollama + Embedding Model

```bash
# Cài đặt Ollama: https://ollama.ai
# Pull embedding model
ollama pull qwen3-embedding:0.6b
```

Kiểm tra Ollama đang chạy tại `http://localhost:11434`:
```bash
curl http://localhost:11434/api/tags
```

---

## 3. Cấu hình file `.env`

Tạo file `.env` ở **thư mục gốc** của project (cùng cấp với `OrbitDocs-backend/` và `rag-backend/`):

```env
# PostgreSQL
DB_URL=jdbc:postgresql://localhost:5432/orbitdocs_db
DB_USERNAME=orbitdocs_admin
DB_PASSWORD=orbitdocs_password

# JWT
JWT_SECRET=your-secret-key-min-32-characters-long-change-in-production

# RAG & Java Integration
PYTHON_RAG_URL=http://localhost:8000
JAVA_BACKEND_URL=http://localhost:8080

# Python RAG Database URL
DATABASE_URL=postgresql://orbitdocs_admin:orbitdocs_password@localhost:5432/orbitdocs_db

# Gemini API Key (lấy tại https://aistudio.google.com/apikey)
GEMINI_API_KEY=your-gemini-api-key-here
```

> Cả Java backend và Python backend đều đọc chung file `.env` này.

---

## 4. Chạy Java Backend (`OrbitDocs-backend`)

### 4.1. Cài đặt dependencies

```bash
cd OrbitDocs-backend
mvn clean install -DskipTests
```

### 4.2. Chạy server

```bash
mvn spring-boot:run
```

Server chạy tại: **http://localhost:8080**

### 4.3. Kiểm tra

- Swagger UI: http://localhost:8080/swagger-ui.html
- Health check: http://localhost:8080/actuator/health

---

## 5. Chạy Python RAG Backend (`rag-backend`)

### 5.1. Tạo virtual environment

```bash
cd rag-backend

# Tạo venv
python -m venv venv

# Kích hoạt (Windows)
venv\Scripts\activate

# Kích hoạt (macOS/Linux)
source venv/bin/activate
```

### 5.2. Cài đặt dependencies

```bash
pip install -r requirements.txt
pip install langchain-ollama
```

### 5.3. Chạy server

```bash
uvicorn main:app --reload --port 8000
```

Server chạy tại: **http://localhost:8000**

### 5.4. Kiểm tra

- Health check: http://localhost:8000/health
- API docs: http://localhost:8000/docs (FastAPI tự tạo Swagger)

---

## 6. Thứ tự khởi động

Chạy theo đúng thứ tự sau:

```
1. PostgreSQL       → Port 5432
2. Ollama           → Port 11434
3. Java Backend     → Port 8080
4. Python RAG       → Port 8000
```

---

## 7. Test nhanh luồng Upload + Chat

### 7.1. Upload tài liệu (Postman)

```
POST http://localhost:8080/api/documents/upload
Content-Type: multipart/form-data

Body (form-data):
  - courseId: <UUID của course>  (lấy từ DB bảng courses)
  - file: <chọn file PDF>
```

### 7.2. Chat với tài liệu (Postman)

```
POST http://localhost:8000/api/chat
Content-Type: application/json

{
    "document_id": "<UUID của document>",
    "query": "Tài liệu này nói về chủ đề gì?",
    "top_k": 5
}
```

Chat theo chương cụ thể:
```json
{
    "document_id": "<UUID>",
    "query": "Giải thích khái niệm trong chương này",
    "chapter_title": "Tên chương (copy từ DB)",
    "top_k": 5
}
```

---

## 8. Cấu trúc thư mục

```
SWD392-GROUP6/
├── .env                          # Biến môi trường (chung cho cả 2 backend)
├── OrbitDocs-backend/            # Java Spring Boot Backend
│   ├── src/main/java/.../
│   │   ├── document/             # Module quản lý tài liệu
│   │   ├── identity/             # Module xác thực (JWT)
│   │   ├── course/               # Module khóa học
│   │   ├── chat/                 # Module chat history
│   │   └── shared/               # Config, exception, response chung
│   ├── src/main/resources/
│   │   ├── application.yaml      # Cấu hình Spring Boot
│   │   └── data.sql              # Seed data
│   └── pom.xml
├── rag-backend/                  # Python FastAPI RAG Backend
│   ├── core/                     # Config & database connection
│   ├── models/                   # SQLAlchemy models (chunk, embedding)
│   ├── routers/                  # API endpoints (indexer, chat)
│   ├── services/                 # Business logic (parser, chunking, embedding, webhook)
│   ├── main.py                   # FastAPI app entry point
│   └── requirements.txt
└── docs/                         # Tài liệu kiến trúc
```
