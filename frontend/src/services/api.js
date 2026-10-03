import axios from 'axios'
import { toast } from 'react-toastify'

/**
 * Axios instance dùng chung cho toàn bộ ứng dụng.
 *
 * - baseURL: vite.config.js proxy /api → http://localhost:8080/api
 * - Request interceptor: tự động thêm JWT token vào header
 * - Response interceptor: xử lý lỗi tập trung
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── REQUEST INTERCEPTOR ─────────────────────────────────
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status
    const message = error.response?.data?.message || 'Đã xảy ra lỗi'

    // Bỏ qua lỗi 401 từ /auth/me (init check khi khởi động app)
    const isAuthMeCall = error.config?.url?.includes('/auth/me')

    if (status === 401) {
      if (!isAuthMeCall) {
        // Token hết hạn khi đang dùng app → xóa và redirect
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Chỉ redirect nếu đang ở trang cần auth, không phải trang public
        const publicPaths = ['/', '/menu', '/login', '/register']
        const isPublic = publicPaths.some(p => window.location.pathname === p || window.location.pathname.startsWith('/menu'))
        if (!isPublic) {
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')
          setTimeout(() => { window.location.href = '/login' }, 1500)
        }
      }
    } else if (status === 403) {
      toast.error('Bạn không có quyền thực hiện thao tác này')
    } else if (status === 404) {
      // Không toast — để component tự xử lý
    } else if (status === 409) {
      toast.error(message)
    } else if (status === 400) {
      // Không toast tự động — để component xử lý validation
    } else if (status >= 500) {
      // Chỉ toast nếu không phải request init
      if (!isAuthMeCall) {
        toast.error('Lỗi máy chủ. Vui lòng thử lại sau.')
      }
    }

    return Promise.reject(error)
  }
)

export default api
