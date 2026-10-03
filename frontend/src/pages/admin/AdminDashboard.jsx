import { useState, useEffect } from 'react'
import { ShoppingBag, Users, ClipboardList, Table2, TrendingUp, DollarSign, CalendarDays, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import dashboardService from '../../services/dashboardService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatCurrency } from '../../utils/formatters'
import { OrderStatusBadge } from '../../components/common/StatusBadge'
import { formatDateTime } from '../../utils/formatters'

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats,    setStats]    = useState(null)
  const [revenue,  setRevenue]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [year,     setYear]     = useState(new Date().getFullYear())

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [s, r] = await Promise.all([
          dashboardService.getStatistics(),
          dashboardService.getRevenueMonthly(year),
        ])
        setStats(s.data.data)
        setRevenue(r.data.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [year])

  if (loading) return <LoadingSpinner />

  const s = stats

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Tổng quan hệ thống</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={DollarSign}   label="Tổng doanh thu"    value={formatCurrency(s.totalRevenue)}    color="bg-green-500"  sub={`${s.completedOrders} đơn hoàn thành`} />
        <StatCard icon={ClipboardList} label="Tổng đơn hàng"   value={s.totalOrders}                      color="bg-blue-500"   sub={`${s.pendingOrders} chờ xác nhận`} />
        <StatCard icon={Users}         label="Khách hàng"       value={s.totalCustomers}                   color="bg-purple-500" sub={`${s.totalStaff} nhân viên`} />
        <StatCard icon={ShoppingBag}   label="Món ăn"           value={s.totalProducts}                    color="bg-orange-500" sub={`${s.availableProducts} đang phục vụ`} />
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Bàn trống',     val: s.availableTables, color: 'text-green-600 bg-green-50'  },
          { label: 'Bàn có khách',  val: s.occupiedTables,  color: 'text-red-600 bg-red-50'      },
          { label: 'Tổng số bàn',   val: s.totalTables,     color: 'text-blue-600 bg-blue-50'    },
        ].map(t => (
          <div key={t.label} className={`card-sm flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <Table2 className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{t.label}</span>
            </div>
            <span className={`text-xl font-bold px-3 py-1 rounded-lg ${t.color}`}>{t.val}</span>
          </div>
        ))}
      </div>

      {/* Reservations row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Đặt bàn chờ xác nhận', val: s.pendingReservations, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Tổng đặt bàn',         val: s.totalReservations,   color: 'text-primary-600 bg-primary-50' },
        ].map(t => (
          <div key={t.label} className={`card-sm flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{t.label}</span>
            </div>
            <span className={`text-xl font-bold px-3 py-1 rounded-lg ${t.color}`}>{t.val}</span>
          </div>
        ))}
        <Link to="/admin/reservations" className="card-sm flex items-center justify-between hover:border-primary-300 transition-colors">
          <span className="text-sm font-medium text-primary-600">Quản lý đặt bàn</span>
          <ArrowRight className="h-4 w-4 text-primary-400" />
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Doanh thu theo tháng</h2>
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="form-input w-28 py-1 text-xs">
              {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v/1000000).toFixed(1)+'M'} />
              <Tooltip formatter={v => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#f97316" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top products */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Top món bán chạy</h2>
          {s.topProducts?.length > 0 ? (
            <div className="space-y-3">
              {s.topProducts.map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                    ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-700' : 'bg-orange-50 text-orange-700'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.productName}</p>
                    <p className="text-xs text-gray-500">{p.totalQuantity} phần</p>
                  </div>
                  <span className="text-sm font-semibold text-primary-500 whitespace-nowrap">
                    {formatCurrency(p.totalRevenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-8">Chưa có dữ liệu</p>}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Đơn hàng gần nhất</h2>
        <div className="table-container">
          <table className="table">
            <thead><tr>
              <th>#ID</th><th>Bàn</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thời gian</th>
            </tr></thead>
            <tbody>
              {s.recentOrders?.map(o => (
                <tr key={o.id}>
                  <td className="font-mono text-xs">#{o.id}</td>
                  <td>Bàn {o.tableNumber}</td>
                  <td>{o.customerName || <span className="text-gray-400">—</span>}</td>
                  <td className="font-semibold text-primary-500">{formatCurrency(o.totalAmount)}</td>
                  <td><OrderStatusBadge status={o.status} /></td>
                  <td className="text-xs text-gray-500">{formatDateTime(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
