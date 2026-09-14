export const ROLES = {
  ADMIN:    'ROLE_ADMIN',
  STAFF:    'ROLE_STAFF',
  CUSTOMER: 'ROLE_CUSTOMER',
}

export const ORDER_STATUS = {
  PENDING:   { label: 'Chờ xác nhận', color: 'badge-yellow' },
  CONFIRMED: { label: 'Đang phục vụ', color: 'badge-blue'   },
  COMPLETED: { label: 'Hoàn thành',   color: 'badge-green'  },
  CANCELLED: { label: 'Đã hủy',       color: 'badge-red'    },
}

export const TABLE_STATUS = {
  AVAILABLE: { label: 'Trống',        color: 'badge-green'  },
  OCCUPIED:  { label: 'Có khách',     color: 'badge-red'    },
  RESERVED:  { label: 'Đã đặt trước', color: 'badge-yellow' },
}

export const PAYMENT_STATUS = {
  PENDING: { label: 'Chờ thanh toán', color: 'badge-yellow' },
  PAID:    { label: 'Đã thanh toán',  color: 'badge-green'  },
  FAILED:  { label: 'Thất bại',       color: 'badge-red'    },
}

export const PRODUCT_STATUS = {
  AVAILABLE:   { label: 'Còn phục vụ', color: 'badge-green' },
  UNAVAILABLE: { label: 'Tạm hết',     color: 'badge-red'   },
}
