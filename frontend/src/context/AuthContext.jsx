import { createContext } from 'react'

// Tách riêng Context để tránh Vite Fast Refresh warning
// AuthProvider nằm trong AuthProvider.jsx
const AuthContext = createContext(null)

export default AuthContext
