-- ============================================================
-- HỆ THỐNG QUẢN LÝ BÁN HÀNG NHÀ HÀNG
-- Database: restaurant_db
-- Version: 1.0
-- ============================================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS restaurant_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE restaurant_db;

-- ============================================================
-- BẢNG USERS
-- Lưu thông tin tất cả người dùng (Admin, Staff, Customer)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL                    COMMENT 'Họ và tên',
    email       VARCHAR(150) NOT NULL UNIQUE             COMMENT 'Email đăng nhập',
    password    VARCHAR(255) NOT NULL                    COMMENT 'Mật khẩu BCrypt',
    phone       VARCHAR(15)                              COMMENT 'Số điện thoại',
    role        ENUM('ROLE_ADMIN','ROLE_STAFF','ROLE_CUSTOMER') NOT NULL DEFAULT 'ROLE_CUSTOMER',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE            COMMENT 'TRUE = hoạt động, FALSE = bị khóa',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Người dùng hệ thống';

-- ============================================================
-- BẢNG CATEGORIES
-- Danh mục món ăn (Món chính, Đồ uống, Tráng miệng, ...)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE             COMMENT 'Tên danh mục',
    description TEXT                                     COMMENT 'Mô tả danh mục',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Danh mục món ăn';

-- ============================================================
-- BẢNG PRODUCTS
-- Thông tin món ăn/đồ uống
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL                    COMMENT 'Tên món',
    description TEXT                                     COMMENT 'Mô tả món',
    price       DECIMAL(10,2) NOT NULL                   COMMENT 'Giá bán (VNĐ)',
    image_url   VARCHAR(500)                             COMMENT 'URL hình ảnh',
    category_id BIGINT NOT NULL                          COMMENT 'FK → categories',
    status      ENUM('AVAILABLE','UNAVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_category FOREIGN KEY (category_id)
        REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,

    INDEX idx_products_category (category_id),
    INDEX idx_products_status (status),
    INDEX idx_products_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Món ăn';

-- ============================================================
-- BẢNG RESTAURANT_TABLES
-- Quản lý bàn ăn (tránh dùng tên "tables" - từ khóa MySQL)
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_number VARCHAR(10) NOT NULL UNIQUE             COMMENT 'Số bàn (VD: 01, 02, A1)',
    capacity     INT NOT NULL                            COMMENT 'Sức chứa (số người)',
    status       ENUM('AVAILABLE','OCCUPIED','RESERVED') NOT NULL DEFAULT 'AVAILABLE',
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_tables_status (status),
    INDEX idx_tables_number (table_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Bàn ăn nhà hàng';

-- ============================================================
-- BẢNG VOUCHERS
-- Mã giảm giá cho đơn hàng
-- ============================================================
CREATE TABLE IF NOT EXISTS vouchers (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    code              VARCHAR(50) NOT NULL UNIQUE,
    name              VARCHAR(100) NOT NULL,
    description       TEXT,
    type              ENUM('PERCENT','FIXED') NOT NULL,
    value             DECIMAL(10,2) NOT NULL,
    min_order_amount  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    max_discount_amount DECIMAL(10,2),
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    start_at          DATETIME,
    end_at            DATETIME,
    usage_limit       INT NOT NULL DEFAULT 0,
    used_count        INT NOT NULL DEFAULT 0,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_vouchers_code (code),
    INDEX idx_vouchers_active (is_active),
    INDEX idx_vouchers_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Mã giảm giá';

-- ============================================================
-- BẢNG ORDERS
-- Đơn hàng - trung tâm của hệ thống
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_id     BIGINT NOT NULL                         COMMENT 'FK → restaurant_tables',
    customer_id  BIGINT                                  COMMENT 'FK → users (customer, nullable)',
    staff_id     BIGINT                                  COMMENT 'FK → users (staff tạo order, nullable)',
    voucher_code VARCHAR(50)                             COMMENT 'Mã voucher áp dụng',
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Số tiền đã giảm',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00     COMMENT 'Tổng tiền sau giảm',
    status       ENUM('PENDING','CONFIRMED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    note         TEXT                                    COMMENT 'Ghi chú đơn hàng',
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_table    FOREIGN KEY (table_id)
        REFERENCES restaurant_tables(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id)
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_orders_staff    FOREIGN KEY (staff_id)
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_orders_table (table_id),
    INDEX idx_orders_customer (customer_id),
    INDEX idx_orders_staff (staff_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_created_at (created_at),
    INDEX idx_orders_voucher (voucher_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Đơn hàng';

-- ============================================================
-- BẢNG ORDER_ITEMS
-- Chi tiết từng món trong đơn hàng
-- Lưu price tại thời điểm đặt để tránh thay đổi giá sau này
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id   BIGINT NOT NULL                           COMMENT 'FK → orders',
    product_id BIGINT NOT NULL                           COMMENT 'FK → products',
    quantity   INT NOT NULL                              COMMENT 'Số lượng',
    price      DECIMAL(10,2) NOT NULL                    COMMENT 'Đơn giá tại thời điểm đặt',
    subtotal   DECIMAL(10,2) NOT NULL                    COMMENT 'price × quantity',

    CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE,

    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Chi tiết đơn hàng';

-- ============================================================
-- BẢNG PAYMENTS
-- Thông tin thanh toán - quan hệ 1:1 với orders
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id   BIGINT NOT NULL UNIQUE                    COMMENT 'FK → orders (1:1)',
    amount     DECIMAL(10,2) NOT NULL                    COMMENT 'Số tiền thanh toán',
    method     ENUM('CASH','BANKING') NOT NULL           COMMENT 'Phương thức thanh toán',
    status     ENUM('PENDING','PAID','FAILED') NOT NULL DEFAULT 'PENDING',
    paid_at    DATETIME                                  COMMENT 'Thời điểm thanh toán thành công',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_order FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_payments_order (order_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_paid_at (paid_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Thanh toán';

-- ============================================================
-- BẢNG RESERVATIONS
-- Đặt bàn trước (PENDING → CONFIRMED → COMPLETED / CANCELLED)
-- ============================================================
CREATE TABLE IF NOT EXISTS reservations (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id     BIGINT NOT NULL                         COMMENT 'FK → users (customer)',
    table_id        BIGINT                                  COMMENT 'FK → restaurant_tables (bán được gán khi xác nhận)',
    guest_count     INT NOT NULL                            COMMENT 'Số khách',
    reservation_date DATE NOT NULL                          COMMENT 'Ngày đặt',
    reservation_time TIME NOT NULL                          COMMENT 'Giờ đặt',
    note            TEXT                                    COMMENT 'Yêu cầu đặc biệt',
    status          ENUM('PENDING','CONFIRMED','CHECKED_IN','CANCELLED','NO_SHOW','COMPLETED') NOT NULL DEFAULT 'PENDING',
    order_id        BIGINT                                  COMMENT 'FK → orders (đơn phát sinh khi đón khách)',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_res_customer FOREIGN KEY (customer_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_res_table    FOREIGN KEY (table_id)
        REFERENCES restaurant_tables(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_res_order    FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_res_customer (customer_id),
    INDEX idx_res_table (table_id),
    INDEX idx_res_order (order_id),
    INDEX idx_res_date (reservation_date),
    INDEX idx_res_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Đặt bàn trước';
