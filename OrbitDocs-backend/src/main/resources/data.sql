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
