import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  UtensilsCrossed, LayoutDashboard, Users, Tag, ShoppingBag,
  Table2, ClipboardList, BarChart3, LogOut, Menu, X,
  Ticket, CalendarDays
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/admin/users',        icon: Users,            label: 'Người dùng'  },
  { to: '/admin/categories',   icon: Tag,              label: 'Danh mục'    },
  { to: '/admin/products',     icon: ShoppingBag,      label: 'Món ăn'      },
  { to: '/admin/tables',       icon: Table2,           label: 'Bàn ăn'      },
  { to: '/admin/orders',       icon: ClipboardList,    label: 'Đơn hàng'    },
  { to: '/admin/reservations', icon: CalendarDays,     label: 'Đặt bàn'     },
  { to: '/admin/vouchers',     icon: Ticket,           label: 'Voucher'      },
  { to: '/admin/reports',      icon: BarChart3,        label: 'Báo cáo'     },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-white border-r border-gray-100 flex flex-col transition-all duration-200 fixed inset-y-0 left-0 z-30`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100 flex-shrink-0">
          <UtensilsCrossed className="h-7 w-7 text-primary-500 flex-shrink-0" />
          {!collapsed && <span className="font-bold text-gray-900 truncate">Nhà Hàng</span>}
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                 ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                 ${collapsed ? 'justify-center px-2' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-gray-100 flex-shrink-0">
          {!collapsed && (
            <div className="px-3 py-2 mb-1">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400">Quản trị viên</p>
            </div>
          )}
          <button onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
                        text-red-500 hover:bg-red-50 transition-colors
                        ${collapsed ? 'justify-center px-2' : ''}`}
            title={collapsed ? 'Đăng xuất' : undefined}>
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${collapsed ? 'ml-16' : 'ml-60'}`}>
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 h-16 flex items-center px-6 gap-4 sticky top-0 z-20">
          <button onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
          <span className="text-sm font-medium text-gray-500">Admin Panel</span>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
