import axios from 'axios'
import { toast } from 'react-toastify'

/**
 * Axios instance dùng chung cho toàn bộ ứng dụng.
 *
 * - baseURL: vite.config.js proxy /api → http://localhost:8080/api
 * - Request interceptor: tự động thêm JWT token vào header
 * - Response interceptor: xử lý lỗi tập trung (401, 403, 500)
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── REQUEST INTERCEPTOR ─────────────────────────────────
// Tự động gắn "Authorization: Bearer <token>" vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── RESPONSE INTERCEPTOR ────────────────────────────────
// Xử lý lỗi tập trung, không cần try/catch ở từng service
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.message || 'Đã xảy ra lỗi'

    if (status === 401) {
      // Token hết hạn hoặc không hợp lệ → đăng xuất
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')
    } else if (status === 403) {
      toast.error('Bạn không có quyền thực hiện thao tác này')
    } else if (status === 404) {
      // Không toast 404 ở đây — để component xử lý
    } else if (status === 409) {
      toast.error(message)
    } else if (status >= 500) {
      toast.error('Lỗi máy chủ. Vui lòng thử lại sau.')
    }

    return Promise.reject(error)
  }
)

export default api
