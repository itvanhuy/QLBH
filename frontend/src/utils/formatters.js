/**
 * Format tiền tệ VNĐ
 * VD: 75000 → "75.000 ₫"
 */
export const formatCurrency = (amount) => {
  if (amount == null) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

/**
 * Format ngày giờ
 * VD: "2026-09-11T10:00:00" → "11/09/2026 10:00"
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('vi-VN', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

/**
 * Format ngày
 * VD: "2026-09-11T10:00:00" → "11/09/2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(dateStr))
}

/**
 * Rút gọn text dài
 */
export const truncate = (text, maxLen = 50) => {
  if (!text) return ''
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
}

/**
 * Format role sang tiếng Việt
 */
export const formatRole = (role) => {
  const map = {
    ROLE_ADMIN:    'Quản trị viên',
    ROLE_STAFF:    'Nhân viên',
    ROLE_CUSTOMER: 'Khách hàng',
  }
  return map[role] || role
}
