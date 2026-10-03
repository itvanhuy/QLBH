USE restaurant_db;

-- ============================================================
-- BẢNG RESERVATIONS - Đặt bàn trước
-- Script nâng cấp cho database ĐÃ TỒN TẠI (chạy khi chưa có bảng reservations).
-- Cài mới: chỉ cần chạy schema.sql + seed_data.sql (đã bao gồm reservations).
-- ============================================================
CREATE TABLE IF NOT EXISTS reservations (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id     BIGINT NOT NULL,
    table_id        BIGINT,
    guest_count     INT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    note            TEXT,
    status          ENUM('PENDING','CONFIRMED','CHECKED_IN','CANCELLED','NO_SHOW','COMPLETED') NOT NULL DEFAULT 'PENDING',
    order_id        BIGINT,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_res_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_res_table    FOREIGN KEY (table_id)    REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    CONSTRAINT fk_res_order    FOREIGN KEY (order_id)    REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_res_customer (customer_id),
    INDEX idx_res_order (order_id),
    INDEX idx_res_date (reservation_date),
    INDEX idx_res_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- NÂNG CẤP từ phiên bản trước (bảng reservations đã tồn tại nhưng
-- thiếu trạng thái CHECKED_IN / NO_SHOW và cột order_id).
-- Bỏ qua lỗi nếu cột/ràng buộc đã tồn tại.
-- ============================================================
ALTER TABLE reservations
    MODIFY COLUMN status ENUM('PENDING','CONFIRMED','CHECKED_IN','CANCELLED','NO_SHOW','COMPLETED') NOT NULL DEFAULT 'PENDING';

-- MySQL không hỗ trợ ADD COLUMN IF NOT EXISTS, chạy 2 lệnh dưới chỉ 1 lần
ALTER TABLE reservations ADD COLUMN order_id BIGINT NULL AFTER table_id;
ALTER TABLE reservations ADD INDEX idx_res_order (order_id);
ALTER TABLE reservations ADD CONSTRAINT fk_res_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed vouchers (dùng đúng tên cột đã có)
INSERT IGNORE INTO vouchers (code, name, type, value, min_order_amount, max_discount_amount, usage_limit, start_at, end_at, is_active) VALUES
('WELCOME10', 'Giảm 10% cho khách mới',    'PERCENT', 10,    50000,  30000, 100, '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE),
('SUMMER50K', 'Giảm 50,000đ hè 2026',      'FIXED',   50000, 200000, NULL,  50,  '2026-06-01 00:00:00', '2026-12-31 23:59:59', TRUE),
('VIP20',     'VIP giảm 20% tối đa 100k',  'PERCENT', 20,    100000, 100000, 20, '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE);

-- Seed reservations mẫu
INSERT IGNORE INTO reservations (customer_id, table_id, guest_count, reservation_date, reservation_time, note, status) VALUES
(4, 6,    4, '2026-10-05', '18:00:00', 'Sinh nhật, cần bánh và nến', 'CONFIRMED'),
(5, 7,    2, '2026-10-06', '12:00:00', NULL,                         'PENDING'),
(6, NULL, 6, '2026-10-07', '19:30:00', 'Họp mặt gia đình',           'PENDING');

SELECT 'reservations' AS tbl, COUNT(*) AS cnt FROM reservations
UNION ALL SELECT 'vouchers', COUNT(*) FROM vouchers;
