import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, UtensilsCrossed, ArrowRight, Clock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import orderService from '../../services/orderService'
import { OrderStatusBadge } from '../../components/common/StatusBadge'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getMyOrders({ page: 0, size: 5 })
      .then(r => setOrders(r.data.data.content))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0">
        <h1 className="text-xl font-bold mb-1">Xin chào, {user?.name}! 👋</h1>
        <p className="text-white/80 text-sm">Chào mừng bạn quay lại nhà hàng của chúng tôi</p>
        <div className="flex gap-3 mt-4">
          <Link to="/menu" className="btn bg-white text-primary-600 hover:bg-gray-50 btn-sm font-semibold">
            <UtensilsCrossed className="h-4 w-4" /> Xem thực đơn
          </Link>
          <Link to="/customer/orders" className="btn border border-white/50 text-white hover:bg-white/10 btn-sm">
            <ClipboardList className="h-4 w-4" /> Đơn hàng của tôi
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng đơn',    val: orders.length,                                      color: 'text-blue-600 bg-blue-50'   },
          { label: 'Đang xử lý', val: orders.filter(o => ['PENDING','CONFIRMED'].includes(o.status)).length, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Hoàn thành', val: orders.filter(o => o.status === 'COMPLETED').length,  color: 'text-green-600 bg-green-50'  },
        ].map(s => (
          <div key={s.label} className="card-sm text-center">
            <p className={`text-2xl font-bold ${s.color.split(' ')[0]} mb-1`}>{s.val}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Đơn hàng gần đây</h2>
          <Link to="/customer/orders" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? <LoadingSpinner size="sm" /> : orders.length === 0
          ? (
            <div className="text-center py-8">
              <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Bạn chưa có đơn hàng nào</p>
              <Link to="/menu" className="btn-primary btn-sm mt-3">Xem thực đơn ngay</Link>
            </div>
          )
          : (
            <div className="space-y-3">
              {orders.map(o => (
                <Link key={o.id} to={`/customer/orders/${o.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                      <UtensilsCrossed className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">Bàn {o.tableNumber} — #{o.id}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDateTime(o.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-500">{formatCurrency(o.totalAmount)}</p>
                    <OrderStatusBadge status={o.status} />
                  </div>
                </Link>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}
