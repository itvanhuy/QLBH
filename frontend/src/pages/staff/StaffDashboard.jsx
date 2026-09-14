import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Table2, Clock, CheckCircle, Plus } from 'lucide-react'
import orderService from '../../services/orderService'
import tableService from '../../services/tableService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { OrderStatusBadge, TableStatusBadge } from '../../components/common/StatusBadge'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

export default function StaffDashboard() {
  const [orders,  setOrders]  = useState([])
  const [tables,  setTables]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      orderService.getAll({ page: 0, size: 10, status: 'PENDING' }),
      tableService.getAll(),
    ]).then(([o, t]) => {
      setOrders(o.data.data.content)
      setTables(t.data.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const available = tables.filter(t => t.status === 'AVAILABLE').length
  const occupied  = tables.filter(t => t.status === 'OCCUPIED').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard nhân viên</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý bàn và đơn hàng</p>
        </div>
        <Link to="/staff/orders/create" className="btn-primary">
          <Plus className="h-4 w-4" /> Tạo đơn hàng
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Table2,       label: 'Bàn trống',    val: available, color: 'bg-green-500'  },
          { icon: Clock,        label: 'Bàn có khách', val: occupied,  color: 'bg-red-500'    },
          { icon: ClipboardList,label: 'Chờ xác nhận', val: orders.length, color: 'bg-yellow-500' },
          { icon: CheckCircle,  label: 'Tổng bàn',     val: tables.length, color: 'bg-blue-500'  },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.color}`}>
              <s.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Table status grid */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Trạng thái bàn</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {tables.map(t => (
              <div key={t.id} className={`p-3 rounded-xl text-center border-2
                ${t.status==='AVAILABLE' ? 'bg-green-50 border-green-200' : t.status==='OCCUPIED' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <p className="font-bold text-gray-900 text-sm">BÀN {t.tableNumber}</p>
                <TableStatusBadge status={t.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Pending orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Đơn chờ xác nhận</h2>
            <Link to="/staff/orders" className="text-sm text-primary-500 hover:underline">Xem tất cả</Link>
          </div>
          {orders.length === 0
            ? <p className="text-sm text-gray-400 text-center py-8">Không có đơn chờ</p>
            : (
              <div className="space-y-3">
                {orders.map(o => (
                  <Link key={o.id} to={`/staff/orders/${o.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">Bàn {o.tableNumber} — #{o.id}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(o.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-500 text-sm">{formatCurrency(o.totalAmount)}</p>
                      <OrderStatusBadge status={o.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}
