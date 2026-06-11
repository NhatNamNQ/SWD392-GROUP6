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

-- Seed default Users (Password for all is '123456')
INSERT INTO users (id, email, password_hash, full_name, is_active, is_password_changed, role_id, created_at, updated_at)
SELECT '00000000-0000-0000-0000-000000000005', 'admin@orbitdocs.com', '$2a$10$wY1twJw3tGNGrs1eYJ3Xz.9h6zU1Y/2b92K5M.eX/A7g5J2s2f2q6', 'System Admin', true, true, (SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1), current_timestamp, current_timestamp
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@orbitdocs.com');

INSERT INTO users (id, email, password_hash, full_name, is_active, is_password_changed, role_id, created_at, updated_at)
SELECT '00000000-0000-0000-0000-000000000006', 'lecturer@orbitdocs.com', '$2a$10$wY1twJw3tGNGrs1eYJ3Xz.9h6zU1Y/2b92K5M.eX/A7g5J2s2f2q6', 'Lecturer User', true, false, (SELECT id FROM roles WHERE name = 'LECTURER' LIMIT 1), current_timestamp, current_timestamp
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'lecturer@orbitdocs.com');

INSERT INTO users (id, email, password_hash, full_name, is_active, is_password_changed, role_id, created_at, updated_at)
SELECT '00000000-0000-0000-0000-000000000007', 'student@orbitdocs.com', '$2a$10$wY1twJw3tGNGrs1eYJ3Xz.9h6zU1Y/2b92K5M.eX/A7g5J2s2f2q6', 'Student User', true, true, (SELECT id FROM roles WHERE name = 'STUDENT' LIMIT 1), current_timestamp, current_timestamp
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'student@orbitdocs.com');
