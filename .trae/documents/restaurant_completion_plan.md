# Hoàn Thành Dự Án Quản Lý Nhà Hàng — Implementation Plan

## Repository Research

Kiến trúc 3 lớp chuẩn:
- **Backend** Spring Boot 3.2.5 (REST API + JWT + JPA + MySQL) tại backend/src/main/java/com/restaurant (config, controller, dto, entity, exception, repository, security, service/impl, util)
- **Frontend** React 18 + Vite 6 + TailwindCSS tại frontend/src (components/common, context, hooks, layouts, pages/admin|staff|customer|public, routes, services, utils)
- **Database** MySQL 8 bảng `restaurant_db` (users, categories, products, restaurant_tables, vouchers, orders, order_items, payments, reservations)

Phân tích đã xác định các vấn đề sau theo thứ tự ưu tiên:

### 🔴 CRITICAL (App crash / không chạy được)
1. `AppRoutes.jsx:29` import `AdminReservations` nhưng **không có file `AdminReservations.jsx` → Vite fail import, app trắng màn hình ngay lúc khởi động

### 🟡 Yêu cầu gốc của user (2 mục)
2. Backend: Khi user `ROLE_CUSTOMER` tự đặt món → order status `CONFIRMED` (đơn đang xử lý/phục vụ) thay vì `PENDING`. Staff/Admin tạo hộ → vẫn `PENDING`
3. Frontend `CustomerOrderCreate.jsx`: Trước khi submit đặt món, hiện `ConfirmDialog` hỏi xác nhận bàn số (khách ở bàn số bao nhiêu, có nhầm không)

### 🟠 HIGH (Logic sai / data sai / bảo mật)
4. RegisterPage.jsx: Regex điện thoại có `\\\\+` (double escape) → match literal `\+` thay vì `+84` hoặc `090...` → không đăng ký được số DT VN hợp lệ
5. OrderServiceImpl.applyVoucher() + addItemsToOrder(): voucher `usedCount` tăng **gấp đôi** (lúc tạo đơn tăng 1, lúc thêm món gọi applyVoucher lại tăng thêm 1 lần nữa)
6. OrderController GET `/api/orders/{id}` và ReservationController GET `/api/reservations/{id}`: Chỉ check `isAuthenticated()`, **không check ownership** → Customer đoán ID thấy đơn/đặt bàn của người khác
7. CustomerDashboard.jsx: Stat cards "Tổng đơn" / "Đang xử lý" / "Hoàn thành" chỉ đếm trong 5 đơn gần đây (size=5) → số liệu SAI nếu user có hơn 5 đơn
8. CustomerProfile.jsx: Sau khi update profile **không refresh AuthContext** → Header + context user name/email vẫn là dữ liệu cũ đến khi reload
9. Order.java `recalculateTotalAmount()` chỉ SUM(subtotal) → **không trừ discountAmount** → nếu gọi standalone sẽ làm mất giảm giá
10. AuthProvider initAuth: không có AbortController → unmount sớm có memory leak warn

### 🟢 MEDIUM (UX / Inconsistency / Chức năng placeholder
11. AdminVouchers.jsx hiện là placeholder ("đangpháttriển" → triển khai CRUD hoàn chỉnh (menu sidebar + route đã có sẵn)
12. CustomerOrderCreate gọi `api.post('/vouchers/validate')` trực tiếp thay vì dùng `voucherService.validate()` (đã có sẵn → inconsistency)
13. ConfirmDialog.jsx các button không có `type="button"` → nếu đặt trong form cha sẽ submit form cha
14. StaffOrderDetail.jsx Payment modal + Transfer modal là inline card, không dùng Modal component → không backdrop / không escape / không lock body scroll
15. StaffPayments.jsx: Payment BANKING auto-confirm luôn như CASH → đánh dấu đã nhận tiền khi chưa chắc vào tài khoản
16. AdminUsers.jsx: Khóa/Mở khóa user **không có ConfirmDialog** → click nhầm khóa luôn (delete mới có confirm)
17. MenuDetailPage.jsx: Link "Đặt ngay" luôn về `/login` → nếu đã auth nên redirect về `/customer/order`
18. AdminDashboard.jsx: Năm hard-coded `[2024,2025,2026]` → nên động dựa trên `new Date().getFullYear()` ± 2 năm
19. AdminLayout sidebar + AppRoutes: mục "Đặt bàn" đã link đến AdminReservations (sẽ fix tại #1)
20. (Optional, light) `utils/constants.js` định nghĩa `ROLES` nhưng 0 nơi dùng → tái sử dụng ở các chỗ hardcode string

## Files and Modules

Sẽ sửa / tạo mới (thứ tự phụ thuộc):

### Tạo file mới
- `frontend/src/pages/admin/AdminReservations.jsx` — quản lý đặt bàn admin (filter status/date, xem chi tiết, xác nhận/hủy, gán bàn)

### Backend (9 files sửa)
- `backend/src/main/java/com/restaurant/service/impl/OrderServiceImpl.java` — #2 (CONFIRMED for CUSTOMER create), #5 (fix voucher usedCount double, #9 fix discountAmount + unit test
- `backend/src/main/java/com/restaurant/entity/Order.java` — #9 (giữ nguyên discountAmount nếu gọi recalc
- `backend/src/main/java/com/restaurant/controller/OrderController.java` — #6 (ownership check GET by id
- `backend/src/main/java/com/restaurant/controller/ReservationController.java` — #6 (ownership check GET by id
- `backend/src/main/java/com/restaurant/security/JwtTokenProvider.java` — UTF-8 charset getBytes + secret length check
- `backend/src/main/java/com/restaurant/service/impl/VoucherServiceImpl.java` — tách helper validate voucher dùng chung (trùng với applyVoucher)

### Frontend (16 files sửa)
- `frontend/src/routes/AppRoutes.jsx` — import AdminReservations mới (#1)
- `frontend/src/layouts/AdminLayout.jsx` — link AdminReservations route OK khi có file
- `frontend/src/pages/customer/CustomerOrderCreate.jsx` — #3 (ConfirmDialog bàn số), #12 (dùng voucherService)
- `frontend/src/pages/public/RegisterPage.jsx` — #4 (fix regex phone)
- `frontend/src/pages/customer/CustomerDashboard.jsx` — #7 (đếm toàn bộ đơn, không chỉ 5)
- `frontend/src/pages/customer/CustomerProfile.jsx` — #8 (refresh context sau update)
- `frontend/src/pages/admin/AdminVouchers.jsx` — #11 triển khai CRUD voucher
- `frontend/src/pages/admin/AdminUsers.jsx` — #16 confirm dialog lock/unlock
- `frontend/src/pages/staff/StaffOrderDetail.jsx` — #14 dùng Modal component
- `frontend/src/pages/staff/StaffPayments.jsx` — #15 BANKING cần xác nhận riêng
- `frontend/src/components/common/ConfirmDialog.jsx` — #13 thêm type="button"
- `frontend/src/pages/public/MenuDetailPage.jsx` — #17 redirect đúng khi auth
- `frontend/src/pages/admin/AdminDashboard.jsx` — #18 năm động
- `frontend/src/pages/customer/CustomerOrderDetail.jsx` — thay `window.confirm` → ConfirmDialog
- `frontend/src/context/AuthProvider.jsx` — #10 AbortController + refactor login dùng api service
- `frontend/src/hooks/useAuth.js` — (optional) export setUser để CustomerProfile gọi refresh context

## Implementation Steps (thứ tự phụ thuộc)

### Giai đoạn 1: Fix CRITICAL (#1) — app phải chạy được
1. **Tạo** `AdminReservations.jsx` tham khảo cấu trúc `CustomerReservations.jsx`, thêm filter (status/date), list table, action xác nhận PENDING → CONFIRMED gán bàn, hủy yêu cầu, xem chi tiết

### Giai đoạn 2: Fix yêu cầu gốc (#2, #3)
2. Backend `OrderServiceImpl.createOrder()`: set initialStatus = ROLE_CUSTOMER ? CONFIRMED : PENDING (#2)
3. Frontend `CustomerOrderCreate.jsx`: Thêm state `confirmOpen`, tách `confirmSubmit()` làm async submit thật, `handleSubmit()` bật dialog, truyền số bàn lấy từ tables.find, message có `<strong>BÀN SỐ X</strong>` (#3)

### Giai đoạn 3: Fix HIGH bugs (#4 → #10)
4. `RegisterPage.jsx`: sửa regex phone từ `'^(\\\\+84|0)...'` thành `'^(\\+84|0)[0-9]{9,10}$'` (#4)
5. `OrderServiceImpl.applyVoucher()`: Tách `validateVoucherCore()` chỉ validate + tính discount (không tăng usedCount). Tạo `consumeVoucherUsage()` tăng usedCount. applyVoucher() dùng core + consume. `addItemsToOrder()` khi gọi lại voucher thì **chỉ gọi validateCore để tính lại discount (không tăng usedCount lần nữa). Khi xóa/hủy đơn gọi refundVoucher() giảm usedCount (#5)
6. `OrderController.getOrderById()`: Load user hiện tại từ SecurityContext → nếu role là CUSTOMER thì check `order.customer.id == user.id` hoặc ném 403. Admin/Staff xem tất cả (#6)
7. `ReservationController.getReservationById()`: Tương tự, customer chỉ xem được reservation của mình (#6)
8. `CustomerDashboard.jsx`: Load toàn bộ đơn (size=1000) hoặc thêm endpoint summary. Hoặc đơn giản: map `orderService.getMyOrders({size:1000})` lấy 1 lần để đếm đủ (#7)
9. `CustomerProfile.jsx`: Export `setUser` từ context → sau khi update success → `setUser(updatedUser)` refresh context ngay lập tức (#8). Cần cập nhật `AuthProvider` export setUser, và `useAuth`
10. `Order.java recalculateTotalAmount()`: đổi thành `totalAmount = SUM(items.subtotal) - COALESCE(discountAmount, 0)` → không bị mất giảm (#9). Lưu ý lúc create order: setDiscountAmount trước khi gọi, hoặc giữ discountAmount cũ. Hoặc trong service gọi trước khi recalc xong set discount lại. Tốt nhất tại entity giữ discountAmount khi recalc: totalAmount = sum + discountAmount? Không. totalAmount đã trừ discount rồi. Tách `recalculateSubtotal()` chỉ tính sum subtotal rồi mới setDiscount áp dụng. Hoặc trong Order.java:
    ```java
    public void recalculateTotalAmount() {
      BigDecimal sub = items.stream()...reduce(ZERO);
      // nếu discount đã set thì trừ
      this.totalAmount = sub.subtract(
        discountAmount != null ? discountAmount : BigDecimal.ZERO
      );
      // đảm bảo không âm
      if (this.totalAmount.compareTo(ZERO) < 0) this.totalAmount = ZERO;
    }
    ```
11. `AuthProvider.jsx initAuth useEffect`: Khởi tạo AbortController controller = new AbortController(), pass `{signal: controller.signal}` vào axios config. Cleanup `return () => controller.abort()` (#10)

### Giai đoạn 4: Fix MEDIUM + chức năng (#11 → #20)
12. Triển khai `AdminVouchers.jsx` CRUD: pattern giống AdminCategories (list, form create/edit, delete confirm). Fields: code, name, type, value, minOrderAmount, maxDiscountAmount, active, start/end date, usageLimit (#11)
13. `CustomerOrderCreate.jsx` đổi `api.post('/vouchers/validate'` → `voucherService.validate({code, orderAmount: subtotal})` (#12)
14. `ConfirmDialog.jsx` thêm `type="button"` cho cả 2 nút (#13)
15. `StaffOrderDetail.jsx` đổi inline pay/transfer card → bọc bằng `<Modal isOpen onClose size>`, dùng Modal component chuẩn (#14)
16. `StaffPayments.jsx handlePayment()`: nếu method == 'BANKING chỉ tạo payment (không confirm) và hiển thị trạng thái CHUYỂN KHOẢN chờ. Hoặc thêm option: CASH auto-confirm (luôn, BANKING confirm bằng tay staff 2 click (#15)
17. `AdminUsers.jsx lock/unlock`: Thêm state `lockTarget`, ConfirmDialog "Bạn có chắc khóa/mở user " + user.name? Không (#16)
18. `MenuDetailPage.jsx`: Check `useAuth isAuthenticated → redirect `/customer/order` thay vì `/login` (#17)
19. `AdminDashboard.jsx`: đổi `years = Array.from({length:5},(_,i) => new Date().getFullYear()-2+i` → [2024,2025,2026,2027,2028] động thời gian thực (#18)
20. `CustomerOrderDetail.jsx cancel`: thay native `window.confirm` → `ConfirmDialog` component consistency

## Dependencies and Considerations
- Tất cả các component admin CRUD pattern consistency: state modal/create/edit/delete. pattern giống AdminCategories/AdminProducts.
- Dùng ConfirmDialog/Modal/Pagination/StatusBadge đã được tái sử dụng từ components/common
- Backend entity/DTO đã có sẵn, ko thay đổi cấu trúc bảng DB
- `voucherService` đã có sẵn methods create/update/delete/validate
- reservationService admin methods `getAll(params)` + `updateStatus(id, {status, tableId})` + `getById(id)` đã có sẵn dùng cho AdminReservations
- Luôn đảm bảo: không thêm dep mới, không breaking change API schema
- Rollback usedCount voucher khi hủy đơn: khi `updateOrderStatus(CANCELLED)` → nếu có voucherCode thì gọi giảm usedCount 1 lần. Cần tracking là voucher nào đã dùng (lưu voucherCode vào order rồi)
- Security ownership check: lấy email từ SecurityContextHolder → userRepository.findByEmail → lấy id → so sánh vs order.customer.id

## Validation
Sau khi implement xong, chạy tuần tự checks:
1. `backend compile: `cd backend && .\mvnw.cmd compile` (không lỗi Java syntax / import
2. Frontend build: `cd frontend && npm run build` (check Vite không báo lỗi import / JSX
3. Login 3 roles xem app mở được, không trắng màn hình
4. Login `admin@gmail.com` vào Dashboard → click "Đặt bàn" → `AdminReservations` load được
5. Login `customer@gmail.com` → Đặt món → chọn Bàn → thêm món → Đặt món → dialog hỏi bàn số → xác nhận → đơn status CONFIRMED ("Đang phục vụ")
6. Đăng ký mới user với SĐT `0901234567` → pattern OK, không báo lỗi regex
7. Customer mở đơn của mình OK; thử GET /orders/{id-của-người-khác} → 403
8. Voucher test: áp voucher, add thêm món → usedCount DB chỉ +1 (không phải +2
9. CustomerDashboard: 5 đơn → đơn thứ 6 → stats đếm đúng 6
10. CustomerProfile đổi tên → header cập nhật ngay lập tức (không cần F5

## Risks và handling
- R1: recalculateTotalAmount sửa entity có thể side effect những nơi gọi service. Giải pháp: test kỹ 3 flow: tạo đơn, update đơn, addItemsToOrder → final totalAmount đúng
- R2: ownership check có thể làm admin/staff xem được đơn của họ (admin role). Giải pháp: chỉ áp dụng ownership check chỉ cho ROLE_CUSTOMER, ADMIN/STAFF pass
- R3: Voucher usedCount rollback khi CANCEL có thể race condition 2 luồng cùng hủy. Giải pháp: usedCount = Math.max(0, usedCount - 1), decrement chỉ khi usedCount > 0
- R4: AdminReservations mới viết có thể thiếu field không đúng ReservationResponse DTO. Giải pháp: tham khảo ReservationController + ReservationResponse + CustomerReservations hiện có
- R5: Frontend build fail nếu import sai tên component. Giải pháp: chạy `npm run build` sớm, đừng fix runtime
