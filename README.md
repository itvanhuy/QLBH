# 🍽️ Restaurant Management System

Hệ thống quản lý bán hàng cho nhà hàng — Đồ án sinh viên Full-Stack

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)

---

## 📋 Giới thiệu

Hệ thống quản lý bán hàng cho nhà hàng với đầy đủ chức năng:

- Quản lý tài khoản người dùng và phân quyền (Admin / Staff / Customer)
- Quản lý thực đơn (danh mục, món ăn)
- Quản lý bàn ăn và trạng thái bàn
- **Đặt bàn trước** — khách giữ chỗ, Staff/Admin xếp bàn, đón khách tự sinh đơn hàng, đặt bàn tự hoàn tất khi khách trả tiền
- Quản lý đơn hàng theo quy trình thực tế
- Xử lý thanh toán (tiền mặt, chuyển khoản)
- Mã giảm giá (voucher) cho đơn hàng
- Dashboard thống kê và báo cáo doanh thu
- Giao diện web responsive cho cả desktop và mobile

---

## 🛠️ Công nghệ sử dụng

### Backend
| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| Java | 17 | Ngôn ngữ lập trình |
| Spring Boot | 3.2.5 | Framework chính |
| Spring Security | 6.x | Authentication & Authorization |
| Spring Data JPA | 3.x | ORM / Database access |
| Hibernate | 6.x | JPA Implementation |
| JJWT | 0.12.5 | JSON Web Token |
| MySQL Connector | 8.x | Kết nối MySQL |
| Lombok | 1.18.x | Giảm boilerplate code |
| Maven | 3.x | Build tool |

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| React | 18.x | UI Framework |
| Vite | 6.x | Build tool / Dev server |
| React Router | 6.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Tailwind CSS | 3.x | Styling |
| Recharts | 2.x | Biểu đồ |
| React Hook Form | 7.x | Form handling |
| React Toastify | 10.x | Toast notifications |
| Lucide React | 0.469 | Icons |

### Database
| Công nghệ | Phiên bản |
|---|---|
| MySQL | 8.0+ |

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────┐
│     Frontend (React)         │  :3000
│  Vite + TailwindCSS          │
└──────────────┬──────────────┘
               │ HTTP/JSON + JWT
               ▼
┌─────────────────────────────┐
│    Backend (Spring Boot)     │  :8080
│                             │
│  Controller → Service →     │
│  Repository → Entity        │
│                             │
│  Spring Security + JWT      │
└──────────────┬──────────────┘
               │ JDBC
               ▼
┌─────────────────────────────┐
│       MySQL Database         │  :3306
│       restaurant_db          │
└─────────────────────────────┘
```

### Backend Package Structure
```
com.restaurant/
├── config/          # SecurityConfig, CorsConfig, JpaConfig
├── controller/      # REST API endpoints
├── service/         # Business logic (interface + impl)
├── repository/      # Spring Data JPA repositories
├── entity/          # JPA entities
├── dto/             # Request/Response DTOs
│   ├── request/
│   └── response/
├── security/        # JWT filter, UserDetailsService
├── exception/       # Custom exceptions, GlobalExceptionHandler
└── util/            # AppConstants
```

### Frontend Structure
```
src/
├── components/      # Reusable components
├── pages/           # Route pages
│   ├── public/
│   ├── admin/
│   ├── staff/
│   └── customer/
├── layouts/         # Page layouts
├── services/        # API service calls
├── context/         # React Context (AuthContext)
├── hooks/           # Custom hooks
├── routes/          # Route guards
└── utils/           # Formatters, constants
```

---

## 🗄️ Database Schema

### Quan hệ giữa các bảng

```
users ──────────────────────── orders
  1:N (customer)                N:1
  1:N (staff)

categories ──────── products ── order_items
  1:N                1:N         N:1

restaurant_tables ── orders ─── payments
  1:N                1:1

orders ──── order_items
  1:N
```

### Các bảng chính

| Bảng | Mô tả |
|---|---|
| `users` | Tài khoản người dùng (Admin/Staff/Customer) |
| `categories` | Danh mục món ăn |
| `products` | Món ăn / Thực đơn |
| `restaurant_tables` | Bàn ăn |
| `reservations` | Đặt bàn trước (ngày, giờ, số khách, bàn xếp, trạng thái, `order_id` liên kết đơn hàng) |
| `orders` | Đơn hàng |
| `order_items` | Chi tiết từng món trong đơn |
| `payments` | Thông tin thanh toán |
| `vouchers` | Mã giảm giá |

---

## 🚀 Cài đặt & Chạy project

### Yêu cầu hệ thống

- **Java JDK 17+** — [Download](https://adoptium.net/)
- **Maven 3.6+** — [Download](https://maven.apache.org/download.cgi)
- **MySQL 8.0+** — [Download](https://dev.mysql.com/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **IDE**: IntelliJ IDEA (Backend) + VS Code (Frontend)

---

### Bước 1: Clone project

```bash
git clone https://github.com/your-username/restaurant-management.git
cd restaurant-management
```

---

### Bước 2: Cấu hình MySQL

```sql
-- Tạo database và schema
mysql -u root -p < database/schema.sql

-- Nhập dữ liệu mẫu
mysql -u root -p < database/seed_data.sql
```

Hoặc mở MySQL Workbench → chạy tuần tự 2 file:
1. `database/schema.sql`
2. `database/seed_data.sql`

---

### Bước 3: Cấu hình Backend

Mở file `backend/src/main/resources/application.properties`:

```properties
# Đổi thành thông tin MySQL của bạn
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Đổi JWT secret (production)
jwt.secret=YourVeryLongSecretKeyAtLeast32Characters
```

---

### Bước 4: Chạy Backend

```bash
cd backend

# Dùng Maven Wrapper (không cần cài Maven riêng)
./mvnw spring-boot:run          # Linux/Mac
mvnw.cmd spring-boot:run        # Windows

# Hoặc trong IntelliJ: Run RestaurantApplication.java
```

✅ Backend khởi động tại: `http://localhost:8080`

---

### Bước 5: Cài và chạy Frontend

```bash
cd frontend

# Cài dependencies
npm install

# Chạy dev server
npm run dev
```

✅ Frontend khởi động tại: `http://localhost:3000`

---

## 🔑 Tài khoản demo

| Role | Email | Mật khẩu |
|---|---|---|
| 🔴 **Admin** | admin@gmail.com | 123456 |
| 🟡 **Staff** | staff@gmail.com | 123456 |
| 🟢 **Customer** | customer@gmail.com | 123456 |

---

## 📡 REST API

### Base URL
```
http://localhost:8080/api
```

### Authentication
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/register` | Đăng ký |
| GET | `/auth/me` | Thông tin user hiện tại |

### Users
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/users` | ADMIN |
| GET | `/users/{id}` | ADMIN |
| PUT | `/users/{id}` | ADMIN |
| DELETE | `/users/{id}` | ADMIN |
| PATCH | `/users/{id}/lock` | ADMIN |
| PATCH | `/users/{id}/unlock` | ADMIN |
| PATCH | `/users/{id}/role` | ADMIN |

### Products & Categories
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/products` | Public |
| GET | `/products/{id}` | Public |
| POST | `/products` | ADMIN/STAFF |
| PUT | `/products/{id}` | ADMIN/STAFF |
| DELETE | `/products/{id}` | ADMIN |
| GET | `/categories` | Public |
| POST | `/categories` | ADMIN/STAFF |
| PUT | `/categories/{id}` | ADMIN/STAFF |
| DELETE | `/categories/{id}` | ADMIN |

### Tables & Orders
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/tables` | Public |
| POST | `/tables` | ADMIN/STAFF |
| PUT | `/tables/{id}` | ADMIN/STAFF |
| PATCH | `/tables/{id}/status` | ADMIN/STAFF |
| GET | `/orders` | ADMIN/STAFF |
| GET | `/orders/my-orders` | Customer |
| POST | `/orders` | Authenticated |
| PATCH | `/orders/{id}/status` | ADMIN/STAFF |

### Reservations (Đặt bàn)
| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/reservations` | Authenticated | Khách đặt bàn (ngày/giờ/số người) |
| GET | `/reservations/my` | Authenticated | Xem đặt bàn của mình |
| GET | `/reservations` | ADMIN/STAFF | Danh sách tất cả (lọc theo status/date) |
| GET | `/reservations/{id}` | Authenticated | Chi tiết (customer chỉ xem của mình) |
| PATCH | `/reservations/{id}/status` | ADMIN/STAFF | Xác nhận + gán bàn / Hủy / Khách không đến |
| POST | `/reservations/{id}/check-in` | ADMIN/STAFF | Đón khách: chiếm bàn + tự tạo đơn hàng trống |
| DELETE | `/reservations/{id}` | Authenticated | Customer hủy đặt bàn của mình |

### Payments & Dashboard
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/payments` | ADMIN/STAFF |
| PATCH | `/payments/{id}/confirm` | ADMIN/STAFF |
| GET | `/dashboard/statistics` | ADMIN |
| GET | `/dashboard/revenue` | ADMIN |
| GET | `/dashboard/top-products` | ADMIN |

---

## 🎯 Quy trình bán hàng

```
1. Staff chọn bàn trống
        ↓
2. Tạo đơn hàng (POST /api/orders)
   → Bàn chuyển: AVAILABLE → OCCUPIED
        ↓
3. Thêm món ăn vào đơn
        ↓
4. Xác nhận đơn (PATCH /api/orders/{id}/status → CONFIRMED)
        ↓
5. Tạo thanh toán (POST /api/payments)
        ↓
6. Xác nhận thu tiền (PATCH /api/payments/{id}/confirm)
   → Payment: PENDING → PAID
   → Order: CONFIRMED → COMPLETED
   → Bàn: OCCUPIED → AVAILABLE
```

### Quy trình đặt bàn trước (mô phỏng đúng nghiệp vụ nhà hàng)

```
1. Khách đặt bàn (POST /api/reservations) — chỉ chọn ngày/giờ/số người, KHÔNG chọn bàn
   → Trạng thái: PENDING
        ↓
2. Admin/Staff xem danh sách đặt bàn → "Xác nhận + Gán bàn"
   (PATCH /api/reservations/{id}/status → CONFIRMED, kèm tableId)
   → Kiểm tra: bàn đủ sức chứa, không trùng lịch bàn khác trong ±2 giờ
        ↓
3. Khách đến → Staff bấm "Đón khách" (POST /api/reservations/{id}/check-in)
   → Reservation: CONFIRMED → CHECKED_IN
   → Bàn:           AVAILABLE → OCCUPIED
   → Tự tạo đơn hàng trống (PENDING) gắn với đặt bàn (reservations.order_id)
        ↓
4. Staff mở đơn hàng của bàn → "Thêm món" → xác nhận đơn → thanh toán
        ↓
5. Khách trả tiền (PATCH /api/payments/{id}/confirm)
   → Order:  CONFIRMED → COMPLETED
   → Reservation tự động: CHECKED_IN → COMPLETED
   → Bàn:    OCCUPIED → AVAILABLE
```

Nhánh khác:

| Tình huống | Trạng thái | Cách xử lý |
|---|---|---|
| Khách báo hủy trước khi đến | `CANCELLED` | Khách tự hủy (DELETE), Staff/Admin hủy hộ |
| Đến giờ mà khách không đến | `NO_SHOW` | Staff bấm "Khách không đến" |
| Staff vô tình đổi sang CHECKED_IN / COMPLETED | bị từ chối | Backend trả về thông báo phải dùng "Đón khách" / sẽ tự hoàn tất khi thanh toán |
| Đơn của khách bị hủy/xóa sau khi đón | `CONFIRMED` | Đặt bàn quay lại trạng thái đã xác nhận, bỏ liên kết đơn cũ để đón lại |
| Khách chuyển sang bàn khác | `CHECKED_IN` | "Chuyển bàn" trên đơn hàng sẽ cập nhật bàn theo |

Ràng buộc nghiệp vụ:
- Một đặt bàn chỉ tạo tối đa một đơn hàng (quan hệ 1-1 qua `reservations.order_id`, `ON DELETE SET NULL`).
- Không đón khách vào bàn đang có đơn hàng chưa hoàn thành.
- Bàn chỉ bị "giữ" (OCCUPIED) khi khách thực đến; CONFIRMED chỉ là xếp bàn trước trên giấy tờ.
- Customer chỉ xem/hủy được đặt bàn của mình và không tự hủy sau khi đã vào bàn.

---

## 📁 Cấu trúc thư mục

```
QLBH/
├── backend/                    # Spring Boot project
│   ├── src/main/java/com/restaurant/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── exception/
│   │   ├── repository/
│   │   ├── security/
│   │   ├── service/
│   │   └── util/
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── frontend/                   # React project
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   ├── schema.sql              # DDL - Tạo bảng (gồm reservations + order_id)
│   ├── seed_data.sql           # DML - Dữ liệu mẫu
│   └── add_reservations.sql    # Nâng cấp DB cũ: bảng reservations + order_id + CHECKED_IN/NO_SHOW
│
└── README.md
```

---

## 🧪 Testing

### Test với Postman

1. Import file `postman/Restaurant_API.postman_collection.json`
2. Import file `postman/Restaurant_ENV.postman_environment.json`
3. Chạy request `Login` → token tự động lưu vào environment
4. Test các API còn lại

### Demo Flow

1. Đăng nhập với `admin@gmail.com` → vào Admin Dashboard
2. Xem thống kê tổng quan (doanh thu, đơn hàng, bàn)
3. Quản lý thực đơn (thêm/sửa món ăn)
4. Đăng nhập với `staff@gmail.com` → vào Staff Panel
5. Xem trạng thái bàn → chọn bàn trống
6. Tạo đơn hàng → chọn món → xác nhận
7. Thanh toán → bàn trở về trạng thái trống
8. Quay lại Admin → kiểm tra doanh thu cập nhật

---

## ⚠️ Lưu ý

- `jwt.secret` trong `application.properties` cần đủ dài (≥ 32 ký tự)
- Không commit password MySQL vào git — dùng environment variables khi deploy
- `spring.jpa.hibernate.ddl-auto=validate` — schema phải chạy `schema.sql` trước
- Frontend dùng Vite proxy `/api` → `localhost:8080` — không cần cấu hình CORS thêm khi dev

---

## 👨‍💻 Tác giả

Đồ án môn học: Phát triển ứng dụng Web  
Công nghệ: Java Spring Boot + ReactJS + MySQL
