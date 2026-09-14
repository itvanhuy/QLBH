import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Layouts
import PublicLayout   from '../layouts/PublicLayout'
import AdminLayout    from '../layouts/AdminLayout'
import StaffLayout    from '../layouts/StaffLayout'
import CustomerLayout from '../layouts/CustomerLayout'

// Guards
import PrivateRoute from './PrivateRoute'
import RoleRoute    from './RoleRoute'

// ── Public pages ──────────────────────────────────────
import HomePage       from '../pages/public/HomePage'
import MenuPage       from '../pages/public/MenuPage'
import MenuDetailPage from '../pages/public/MenuDetailPage'
import LoginPage      from '../pages/public/LoginPage'
import RegisterPage   from '../pages/public/RegisterPage'

// ── Admin pages ───────────────────────────────────────
import AdminDashboard  from '../pages/admin/AdminDashboard'
import AdminUsers      from '../pages/admin/AdminUsers'
import AdminCategories from '../pages/admin/AdminCategories'
import AdminProducts   from '../pages/admin/AdminProducts'
import AdminTables     from '../pages/admin/AdminTables'
import AdminOrders     from '../pages/admin/AdminOrders'
import AdminVouchers   from '../pages/admin/AdminVouchers'
import AdminReports    from '../pages/admin/AdminReports'

// ── Staff pages ───────────────────────────────────────
import StaffDashboard   from '../pages/staff/StaffDashboard'
import StaffTables      from '../pages/staff/StaffTables'
import StaffOrders      from '../pages/staff/StaffOrders'
import StaffOrderCreate from '../pages/staff/StaffOrderCreate'
import StaffOrderDetail from '../pages/staff/StaffOrderDetail'
import StaffPayments    from '../pages/staff/StaffPayments'

// ── Customer pages ────────────────────────────────────
import CustomerDashboard   from '../pages/customer/CustomerDashboard'
import CustomerOrders      from '../pages/customer/CustomerOrders'
import CustomerOrderDetail from '../pages/customer/CustomerOrderDetail'
import CustomerProfile     from '../pages/customer/CustomerProfile'

export default function AppRoutes() {
  const { user, isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* ── PUBLIC ──────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/"          element={<HomePage />} />
        <Route path="/menu"      element={<MenuPage />} />
        <Route path="/menu/:id"  element={<MenuDetailPage />} />
        <Route path="/login"     element={
          isAuthenticated
            ? <Navigate to={getHomeByRole(user?.role)} replace />
            : <LoginPage />
        } />
        <Route path="/register"  element={
          isAuthenticated
            ? <Navigate to={getHomeByRole(user?.role)} replace />
            : <RegisterPage />
        } />
      </Route>

      {/* ── ADMIN ───────────────────────────────────── */}
      <Route path="/admin" element={
        <RoleRoute allowedRoles={['ROLE_ADMIN']}>
          <AdminLayout />
        </RoleRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"  element={<AdminDashboard />} />
        <Route path="users"      element={<AdminUsers />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="products"   element={<AdminProducts />} />
        <Route path="tables"     element={<AdminTables />} />
        <Route path="orders"     element={<AdminOrders />} />
        <Route path="vouchers"   element={<AdminVouchers />} />
        <Route path="reports"    element={<AdminReports />} />
      </Route>

      {/* ── STAFF ───────────────────────────────────── */}
      <Route path="/staff" element={
        <RoleRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF']}>
          <StaffLayout />
        </RoleRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<StaffDashboard />} />
        <Route path="tables"        element={<StaffTables />} />
        <Route path="orders"        element={<StaffOrders />} />
        <Route path="orders/create" element={<StaffOrderCreate />} />
        <Route path="orders/:id"    element={<StaffOrderDetail />} />
        <Route path="payments"      element={<StaffPayments />} />
      </Route>

      {/* ── CUSTOMER ────────────────────────────────── */}
      <Route path="/customer" element={
        <PrivateRoute>
          <CustomerLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"   element={<CustomerDashboard />} />
        <Route path="orders"      element={<CustomerOrders />} />
        <Route path="orders/:id"  element={<CustomerOrderDetail />} />
        <Route path="profile"     element={<CustomerProfile />} />
      </Route>

      {/* ── 404 ─────────────────────────────────────── */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
          <h1 className="text-6xl font-bold text-gray-300">404</h1>
          <p className="text-gray-500">Trang không tồn tại</p>
          <a href="/" className="btn-primary">Về trang chủ</a>
        </div>
      } />
    </Routes>
  )
}

function getHomeByRole(role) {
  switch (role) {
    case 'ROLE_ADMIN':    return '/admin/dashboard'
    case 'ROLE_STAFF':    return '/staff/dashboard'
    case 'ROLE_CUSTOMER': return '/customer/dashboard'
    default:              return '/'
  }
}
