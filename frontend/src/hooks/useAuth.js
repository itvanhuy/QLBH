import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

/**
 * Custom hook để dùng AuthContext.
 * Dùng trong component thay vì import AuthContext trực tiếp.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth phải được dùng trong AuthProvider')
  }
  return context
}
