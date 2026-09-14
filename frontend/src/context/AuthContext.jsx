import { createContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

/**
 * AuthContext: quản lý trạng thái đăng nhập toàn cục.
 *
 * Cung cấp:
 *   - user: thông tin user đang đăng nhập (null nếu chưa login)
 *   - token: JWT token
 *   - loading: đang kiểm tra auth trạng thái ban đầu
 *   - login(): đăng nhập
 *   - logout(): đăng xuất
 *   - isAuthenticated: boolean
 *   - isAdmin / isStaff / isCustomer: kiểm tra role nhanh
 */
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Khi app khởi động: nếu có token trong localStorage thì lấy thông tin user
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        try {
          const res = await authService.getMe()
          setUser(res.data.data)
        } catch {
          // Token không hợp lệ hoặc hết hạn → xóa
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  /**
   * Đăng nhập: gọi API, lưu token vào localStorage, set state
   */
  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password)
    const { token: newToken, user: userData } = res.data.data

    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)

    return userData // Trả về để component điều hướng theo role
  }, [])

  /**
   * Đăng xuất: xóa token, reset state
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  // Helper kiểm tra role nhanh
  const isAuthenticated = !!user
  const isAdmin    = user?.role === 'ROLE_ADMIN'
  const isStaff    = user?.role === 'ROLE_STAFF'
  const isCustomer = user?.role === 'ROLE_CUSTOMER'

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isStaff,
    isCustomer,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
