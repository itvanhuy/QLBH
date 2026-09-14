USE restaurant_db;

-- BCrypt hash đúng cho password "123456" (strength=10, verified)
UPDATE users SET password = '$2a$10$TUv.5dMc5PEIk5ooGpaIUuDBCPWJo8uLoGt8GH4xuUMhtE87u0MDa';

SELECT 'Password updated for all users' AS result;
SELECT email, LEFT(password, 30) AS pwd_prefix FROM users;
