import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { UtensilsCrossed, Menu, X, LogOut, User } from 'lucide-react'
import { useState } from 'react'

export default function PublicLayout() {
  const { isAuthenticated, user, logout, isAdmin, isStaff } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard'
    if (isStaff) return '/staff/dashboard'
    return '/customer/dashboard'
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ────────────────────────────────────────── */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-primary-500 font-bold text-xl">
              <UtensilsCrossed className="h-7 w-7" />
              <span>Nhà Hàng</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/"     className="text-sm text-gray-600 hover:text-primary-500 font-medium transition-colors">Trang chủ</Link>
              <Link to="/menu" className="text-sm text-gray-600 hover:text-primary-500 font-medium transition-colors">Thực đơn</Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link to={getDashboardLink()} className="btn-outline btn-sm gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    {user?.name}
                  </Link>
                  <button onClick={handleLogout} className="btn-secondary btn-sm gap-1.5">
                    <LogOut className="h-3.5 w-3.5" />
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login"    className="btn-outline btn-sm">Đăng nhập</Link>
                  <Link to="/register" className="btn-primary btn-sm">Đăng ký</Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 py-3 space-y-2 bg-white">
            <Link to="/"     onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-600">Trang chủ</Link>
            <Link to="/menu" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-600">Thực đơn</Link>
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-600">Dashboard</Link>
                <button onClick={handleLogout} className="block py-2 text-sm text-red-500">Đăng xuất</button>
              </>
            ) : (
              <>
                <Link to="/login"    onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-600">Đăng nhập</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-primary-500 font-medium">Đăng ký</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ── Content ──────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <div className="flex items-center justify-center gap-2 text-white font-semibold mb-2">
            <UtensilsCrossed className="h-5 w-5 text-primary-400" />
            <span>Nhà Hàng Restaurant</span>
          </div>
          <p>© 2026 Restaurant Management System. Đồ án sinh viên.</p>
        </div>
      </footer>
    </div>
  )
}
