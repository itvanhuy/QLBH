package com.restaurant.util;

/**
 * Hằng số dùng chung trong toàn bộ ứng dụng.
 * Tập trung tại đây để dễ thay đổi, tránh hardcode.
 */
public final class AppConstants {

    // Không cho phép tạo instance
    private AppConstants() {}

    // ====================================================
    // PAGINATION
    // ====================================================
    public static final int DEFAULT_PAGE_NUMBER = 0;   // Spring Data bắt đầu từ 0
    public static final int DEFAULT_PAGE_SIZE   = 20;
    public static final int MAX_PAGE_SIZE       = 100;

    // ====================================================
    // SORT
    // ====================================================
    public static final String DEFAULT_SORT_BY        = "createdAt";
    public static final String DEFAULT_SORT_DIRECTION = "desc";

    // ====================================================
    // JWT
    // ====================================================
    public static final String TOKEN_PREFIX      = "Bearer ";
    public static final String HEADER_STRING     = "Authorization";

    // ====================================================
    // ROLES (dùng trong @PreAuthorize)
    // ====================================================
    public static final String ROLE_ADMIN    = "ROLE_ADMIN";
    public static final String ROLE_STAFF    = "ROLE_STAFF";
    public static final String ROLE_CUSTOMER = "ROLE_CUSTOMER";

    // ====================================================
    // MESSAGES - thông báo lỗi thống nhất
    // ====================================================
    public static final String USER_NOT_FOUND     = "Không tìm thấy người dùng";
    public static final String EMAIL_ALREADY_EXISTS = "Email đã được sử dụng";
    public static final String INVALID_CREDENTIALS = "Email hoặc mật khẩu không đúng";
    public static final String ACCOUNT_LOCKED     = "Tài khoản đã bị khóa";

    public static final String CATEGORY_NOT_FOUND  = "Không tìm thấy danh mục";
    public static final String CATEGORY_NAME_EXISTS = "Tên danh mục đã tồn tại";
    public static final String CATEGORY_HAS_PRODUCTS = "Danh mục đang có món ăn, không thể xóa";

    public static final String PRODUCT_NOT_FOUND   = "Không tìm thấy món ăn";
    public static final String PRODUCT_UNAVAILABLE = "Món ăn hiện không còn phục vụ";

    public static final String TABLE_NOT_FOUND      = "Không tìm thấy bàn";
    public static final String TABLE_NUMBER_EXISTS  = "Số bàn đã tồn tại";
    public static final String TABLE_NOT_AVAILABLE  = "Bàn không khả dụng";

    public static final String ORDER_NOT_FOUND      = "Không tìm thấy đơn hàng";
    public static final String ORDER_CANNOT_CANCEL  = "Đơn hàng không thể hủy ở trạng thái hiện tại";
    public static final String ORDER_ALREADY_PAID   = "Đơn hàng đã được thanh toán";

    public static final String PAYMENT_NOT_FOUND    = "Không tìm thấy thanh toán";
    public static final String PAYMENT_ALREADY_EXISTS = "Đơn hàng đã có thông tin thanh toán";

    public static final String ACCESS_DENIED        = "Bạn không có quyền thực hiện thao tác này";
    public static final String UNAUTHORIZED         = "Vui lòng đăng nhập để tiếp tục";
}
