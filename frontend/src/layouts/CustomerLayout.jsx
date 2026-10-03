import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  UtensilsCrossed, LayoutDashboard, ClipboardList,
  User, LogOut, ShoppingCart, CalendarDays, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/customer/dashboard',    icon: LayoutDashboard, label: 'Tổng quan'  },
  { to: '/customer/order',        icon: ShoppingCart,    label: 'Đặt món'    },
  { to: '/customer/reservations', icon: CalendarDays,    label: 'Đặt bàn'    },
  { to: '/customer/orders',       icon: ClipboardList,   label: 'Đơn hàng'   },
  { to: '/customer/profile',      icon: User,            label: 'Hồ sơ'      },
]

export default function CustomerLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-primary-500 font-bold text-lg flex-shrink-0">
            <UtensilsCrossed className="h-6 w-6" />
            <span className="hidden sm:inline">Nhà Hàng</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                   ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:bg-gray-100'}`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors ml-1">
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất</span>
            </button>
          </div>

          {/* Mobile burger */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                   ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:bg-gray-50'}`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full">
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </nav>

      {/* Welcome bar */}
      <div className="bg-primary-500 text-white py-2.5">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <p className="text-sm">
            Xin chào, <strong>{user?.name}</strong> 👋
          </p>
          <Link to="/customer/order"
            className="btn bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg font-medium">
            <ShoppingCart className="h-3.5 w-3.5" />
            Đặt món ngay
          </Link>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
