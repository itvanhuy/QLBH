import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import AuthContext from './AuthContext'
import authService from '../services/authService'

export default function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Khởi động app: kiểm tra token còn hợp lệ không
  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        try {
          // Dùng axios gốc để tránh interceptor của api.js gây toast lỗi
          const res = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` },
            signal: controller.signal,
          })
          if (!cancelled) setUser(res.data.data)
        } catch (err) {
          if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return
          // Token hết hạn hoặc không hợp lệ → reset, KHÔNG show toast
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setToken(null)
          setUser(null)
        }
      }
      if (!cancelled) setLoading(false)
    }
    initAuth()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password)
    const { token: newToken, user: userData } = res.data.data
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
    return userData
  }, [])

  /**
   * Refresh user hiện tại (gọi sau khi user update profile).
   * Priority: nếu truyền userData mới thì dùng luôn; không thì gọi getMe lấy từ backend.
   */
  const refreshUser = useCallback(async (userData) => {
    if (userData) {
      setUser(userData)
      return userData
    }
    try {
      const res = await authService.getMe()
      setUser(res.data.data)
      return res.data.data
    } catch (err) {
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      token,
      loading,
      login,
      logout,
      refreshUser,
      isAuthenticated: !!user,
      isAdmin:    user?.role === 'ROLE_ADMIN',
      isStaff:    user?.role === 'ROLE_STAFF',
      isCustomer: user?.role === 'ROLE_CUSTOMER',
    }}>
      {children}
    </AuthContext.Provider>
  )
}
