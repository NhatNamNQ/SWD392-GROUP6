-- Seed default roles (run once on startup when table is empty)
INSERT INTO roles (name, description)
SELECT 'ADMIN', 'System administrator'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ADMIN');

INSERT INTO roles (name, description)
SELECT 'LECTURER', 'Course lecturer - manages documents'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'LECTURER');

INSERT INTO roles (name, description)
SELECT 'STUDENT', 'Student - uses the chatbot'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'STUDENT');

-- Seed default Mock User
INSERT INTO users (id, email, password_hash, full_name, is_active, role_id, created_at, updated_at)
SELECT '00000000-0000-0000-0000-000000000001', 'mockuser@orbitdocs.com', 'dummy_hash_for_testing', 'Mock User', true, (SELECT id FROM roles WHERE name = 'LECTURER' LIMIT 1), current_timestamp, current_timestamp
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mockuser@orbitdocs.com');
