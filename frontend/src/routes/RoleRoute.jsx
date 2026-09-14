import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/common/LoadingSpinner'

/**
 * Bảo vệ route theo role.
 * allowedRoles: mảng role được phép — VD: ['ROLE_ADMIN']
 *
 * Nếu đã login nhưng sai role → chuyển về trang phù hợp với role của họ.
 */
export default function RoleRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth()
  
  if (loading) return <LoadingSpinner fullScreen />

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (!allowedRoles.includes(user?.role)) {
    // Điều hướng về dashboard đúng với role
    const redirect = getDefaultRoute(user?.role)
    return <Navigate to={redirect} replace />
  }

  return children
}

function getDefaultRoute(role) {
  switch (role) {
    case 'ROLE_ADMIN':    return '/admin/dashboard'
    case 'ROLE_STAFF':    return '/staff/dashboard'
    case 'ROLE_CUSTOMER': return '/customer/dashboard'
    default:              return '/'
  }
}
