-- ============================================================
-- SEED DATA - Dữ liệu mẫu để demo
-- Chạy sau schema.sql
-- ============================================================

USE restaurant_db;

-- ============================================================
-- 1. USERS
-- Password: 123456 → BCrypt hash
-- ============================================================
INSERT INTO users (name, email, password, phone, role, is_active) VALUES
-- Admin
('Nguyễn Quản Trị',  'admin@gmail.com',    '$2a$10$TUv.5dMc5PEIk5ooGpaIUuDBCPWJo8uLoGt8GH4xuUMhtE87u0MDa', '0901234567', 'ROLE_ADMIN',    TRUE),
-- Staff
('Trần Nhân Viên',   'staff@gmail.com',    '$2a$10$TUv.5dMc5PEIk5ooGpaIUuDBCPWJo8uLoGt8GH4xuUMhtE87u0MDa', '0912345678', 'ROLE_STAFF',    TRUE),
('Lê Thị Hoa',       'staff2@gmail.com',   '$2a$10$TUv.5dMc5PEIk5ooGpaIUuDBCPWJo8uLoGt8GH4xuUMhtE87u0MDa', '0923456789', 'ROLE_STAFF',    TRUE),
-- Customers
('Phạm Khách Hàng',  'customer@gmail.com', '$2a$10$TUv.5dMc5PEIk5ooGpaIUuDBCPWJo8uLoGt8GH4xuUMhtE87u0MDa', '0934567890', 'ROLE_CUSTOMER', TRUE),
('Hoàng Văn Minh',   'minh@gmail.com',     '$2a$10$TUv.5dMc5PEIk5ooGpaIUuDBCPWJo8uLoGt8GH4xuUMhtE87u0MDa', '0945678901', 'ROLE_CUSTOMER', TRUE),
('Nguyễn Thị Lan',   'lan@gmail.com',      '$2a$10$TUv.5dMc5PEIk5ooGpaIUuDBCPWJo8uLoGt8GH4xuUMhtE87u0MDa', '0956789012', 'ROLE_CUSTOMER', TRUE),
('Vũ Đức Thành',     'thanh@gmail.com',    '$2a$10$TUv.5dMc5PEIk5ooGpaIUuDBCPWJo8uLoGt8GH4xuUMhtE87u0MDa', '0967890123', 'ROLE_CUSTOMER', FALSE); -- Tài khoản bị khóa để demo

-- ============================================================
-- 2. CATEGORIES - 5 danh mục
-- ============================================================
INSERT INTO categories (name, description) VALUES
('Món khai vị',   'Các món ăn nhẹ, khai vị trước bữa chính'),
('Món chính',     'Các món ăn chính, cơm, mì, bún, lẩu'),
('Món tráng miệng', 'Bánh, chè, kem và các món ngọt'),
('Đồ uống',       'Nước ngọt, nước trái cây, trà, cà phê'),
('Đồ ăn nhanh',   'Burger, pizza, gà rán và các món ăn nhanh');

-- ============================================================
-- 3. PRODUCTS - 20 món ăn
-- ============================================================
INSERT INTO products (name, description, price, image_url, category_id, status) VALUES
-- Món khai vị (category_id = 1)
('Chả giò chiên',       'Chả giò nhân thịt heo, tôm chiên giòn, ăn kèm rau sống',         45000,  'https://placehold.co/400x300?text=Cha+Gio',    1, 'AVAILABLE'),
('Gỏi cuốn tôm thịt',   'Gỏi cuốn tươi nhân tôm, thịt heo, bún, rau sống',               50000,  'https://placehold.co/400x300?text=Goi+Cuon',   1, 'AVAILABLE'),
('Súp bắp gà',          'Súp bắp Mỹ với thịt gà xé, trứng cút',                           35000,  'https://placehold.co/400x300?text=Sup+Bap',    1, 'AVAILABLE'),

-- Món chính (category_id = 2)
('Cơm sườn nướng',      'Cơm trắng với sườn heo nướng, dưa cải, đồ chua',                 75000,  'https://placehold.co/400x300?text=Com+Suon',   2, 'AVAILABLE'),
('Bún bò Huế',          'Bún bò Huế truyền thống, bò, chả, rau sống, huyết',              70000,  'https://placehold.co/400x300?text=Bun+Bo',     2, 'AVAILABLE'),
('Phở bò tái',          'Phở bò tái chín, nước dùng trong, thơm ngon',                    65000,  'https://placehold.co/400x300?text=Pho+Bo',     2, 'AVAILABLE'),
('Lẩu thái hải sản',    'Lẩu Thái cay chua với tôm, mực, nghêu, cá viên (2 người)',       250000, 'https://placehold.co/400x300?text=Lau+Thai',   2, 'AVAILABLE'),
('Mì xào hải sản',      'Mì xào với tôm, mực, rau cải, nước sốt oyster',                  85000,  'https://placehold.co/400x300?text=Mi+Xao',     2, 'AVAILABLE'),
('Cơm chiên dương châu','Cơm chiên dương châu, thịt xá xíu, tôm, trứng',                  65000,  'https://placehold.co/400x300?text=Com+Chien',  2, 'AVAILABLE'),
('Gà nướng muối ớt',    'Gà nướng nguyên con/nửa con với sốt muối ớt đặc biệt',           180000, 'https://placehold.co/400x300?text=Ga+Nuong',   2, 'UNAVAILABLE'),

-- Món tráng miệng (category_id = 3)
('Chè đậu xanh',        'Chè đậu xanh đánh, nước cốt dừa thơm béo',                       25000,  'https://placehold.co/400x300?text=Che+Dau',    3, 'AVAILABLE'),
('Kem dừa',             'Kem dừa 2 cầu, nước cốt dừa',                                     30000,  'https://placehold.co/400x300?text=Kem+Dua',    3, 'AVAILABLE'),
('Bánh flan caramel',   'Bánh flan trứng sữa mềm mịn, sốt caramel',                        30000,  'https://placehold.co/400x300?text=Banh+Flan',  3, 'AVAILABLE'),

-- Đồ uống (category_id = 4)
('Coca Cola',           'Coca Cola lon 330ml lạnh',                                         20000,  'https://placehold.co/400x300?text=Coca+Cola',  4, 'AVAILABLE'),
('Nước cam ép',         'Nước cam ép tươi nguyên chất 300ml',                               30000,  'https://placehold.co/400x300?text=Cam+Ep',     4, 'AVAILABLE'),
('Trà đào cam sả',      'Trà đào với cam sả, đá viên, mát lạnh',                            35000,  'https://placehold.co/400x300?text=Tra+Dao',    4, 'AVAILABLE'),
('Cà phê sữa đá',       'Cà phê phin Việt Nam với sữa đặc, đá',                             25000,  'https://placehold.co/400x300?text=Ca+Phe',     4, 'AVAILABLE'),

-- Đồ ăn nhanh (category_id = 5)
('Burger bò phô mai',   'Burger bò 100g, phô mai cheddar, rau xà lách, cà chua',           75000,  'https://placehold.co/400x300?text=Burger',     5, 'AVAILABLE'),
('Pizza margherita',    'Pizza đế mỏng, sốt cà chua, phô mai mozzarella, húng quế',        120000, 'https://placehold.co/400x300?text=Pizza',      5, 'AVAILABLE'),
('Gà rán giòn',         'Đùi gà rán giòn, kèm khoai tây chiên và sốt mayo',                65000,  'https://placehold.co/400x300?text=Ga+Ran',     5, 'AVAILABLE');

-- ============================================================
-- 4. RESTAURANT_TABLES - 10 bàn
-- ============================================================
INSERT INTO restaurant_tables (table_number, capacity, status) VALUES
('01', 2,  'AVAILABLE'),
('02', 2,  'AVAILABLE'),
('03', 4,  'AVAILABLE'),
('04', 4,  'AVAILABLE'),
('05', 4,  'OCCUPIED'),   -- Đang có khách để demo
('06', 6,  'AVAILABLE'),
('07', 6,  'AVAILABLE'),
('08', 8,  'RESERVED'),   -- Đã đặt trước để demo
('09', 8,  'AVAILABLE'),
('10', 10, 'AVAILABLE');

-- ============================================================
-- 4.5 VOUCHERS - Mã giảm giá mẫu
-- ============================================================
INSERT INTO vouchers (code, name, description, type, value, min_order_amount, max_discount_amount, is_active, start_at, end_at, usage_limit, used_count) VALUES
('SAVE10', 'Giảm 10%', 'Giảm 10% cho đơn từ 200,000đ', 'PERCENT', 10, 200000, 50000, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 100, 0),
('WELCOME50', 'Giảm 50k', 'Giảm 50k cho khách mới', 'FIXED', 50000, 300000, NULL, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), 50, 0),
('VIP20', 'VIP 20%', 'Khách hàng thân thiết được giảm 20%', 'PERCENT', 20, 500000, 100000, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 200, 0);

-- ============================================================
-- 5. ORDERS - Một số đơn hàng mẫu
-- ============================================================
INSERT INTO orders (table_id, customer_id, staff_id, voucher_code, discount_amount, total_amount, status, note) VALUES
-- Order 1: Bàn 05 đang OCCUPIED - CONFIRMED
(5, 4, 2, 'SAVE10', 27500, 247500, 'CONFIRMED',  'Ít cay'),
-- Order 2: Đã hoàn thành
(3, 5, 2, 'WELCOME50', 50000, 145000, 'COMPLETED',  NULL),
-- Order 3: Đã hoàn thành
(7, 6, 3, 'VIP20', 30000, 120000, 'COMPLETED',  'Không hành'),
-- Order 4: Đã hủy
(2, 4, 2, NULL, 0, 120000, 'CANCELLED',  'Khách hủy'),
-- Order 5: Pending mới tạo
(6, 5, 3, NULL, 0, 90000,  'PENDING',    NULL);

-- ============================================================
-- 6. ORDER_ITEMS - Chi tiết đơn hàng
-- ============================================================
INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES
-- Order 1: Bàn 05
(1, 18, 2, 75000,  150000),  -- Burger bò phô mai × 2
(1, 14, 2, 20000,   40000),  -- Coca Cola × 2
(1, 19, 1, 120000, 120000),  -- Pizza margherita × 1
-- Tổng: 310000 (đã trừ thuế/phí trong total_amount demo = 275000)

-- Order 2: Bàn 03 (completed)
(2, 4,  1, 75000,  75000),   -- Cơm sườn nướng × 1
(2, 5,  1, 70000,  70000),   -- Bún bò Huế × 1
(2, 16, 2, 35000,  70000),   -- Trà đào cam sả × 2
-- Tổng: 215000 (total_amount = 195000)

-- Order 3: Bàn 07 (completed)
(3, 6,  2, 65000,  130000),  -- Phở bò tái × 2
(3, 17, 2, 25000,  50000),   -- Cà phê sữa đá × 2
-- Tổng: 180000 (total_amount = 150000)

-- Order 4: Bàn 02 (cancelled)
(4, 19, 1, 120000, 120000),  -- Pizza margherita × 1

-- Order 5: Bàn 06 (pending)
(5, 9,  1, 65000,  65000),   -- Cơm chiên dương châu × 1
(5, 15, 1, 30000,  30000);   -- Nước cam ép × 1

-- ============================================================
-- 7. PAYMENTS - Thanh toán cho các order đã hoàn thành
-- ============================================================
INSERT INTO payments (order_id, amount, method, status, paid_at) VALUES
(2, 195000, 'CASH',    'PAID', '2026-09-10 12:30:00'),
(3, 150000, 'BANKING', 'PAID', '2026-09-10 19:45:00'),
(4, 120000, 'CASH',    'FAILED', NULL);  -- Order bị hủy, payment failed

-- ============================================================
-- VERIFY - Kiểm tra dữ liệu
-- ============================================================
SELECT 'users'              AS `table`, COUNT(*) AS `count` FROM users
UNION ALL
SELECT 'categories',         COUNT(*) FROM categories
UNION ALL
SELECT 'products',           COUNT(*) FROM products
UNION ALL
SELECT 'restaurant_tables',  COUNT(*) FROM restaurant_tables
UNION ALL
SELECT 'orders',             COUNT(*) FROM orders
UNION ALL
SELECT 'order_items',        COUNT(*) FROM order_items
UNION ALL
SELECT 'payments',           COUNT(*) FROM payments;
