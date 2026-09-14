USE restaurant_db;

-- BCrypt hash của "123456" với strength=10
-- Hash này đã được verify: $2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36zLFvvbSfq2uyeV71yCgFq
UPDATE users SET password = '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36zLFvvbSfq2uyeV71yCgFq';

-- Verify
SELECT email, password FROM users;
