import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { UtensilsCrossed, Clock } from 'lucide-react'
import orderService from '../../services/orderService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import EmptyState from '../../components/common/EmptyState'
import { OrderStatusBadge } from '../../components/common/StatusBadge'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

const STATUSES = ['PENDING','CONFIRMED','COMPLETED','CANCELLED']

export default function CustomerOrders() {
  const [orders,       setOrders]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [page,         setPage]         = useState(0)
  const [totalPages,   setTotalPages]   = useState(0)
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, size: 10 }
      if (statusFilter) params.status = statusFilter
      const r = await orderService.getMyOrders(params)
      setOrders(r.data.data.content)
      setTotalPages(r.data.data.totalPages)
    } finally { setLoading(false) }
  }, [page, statusFilter])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setStatusFilter(''); setPage(0) }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
            ${!statusFilter ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Tất cả
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(0) }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${statusFilter === s ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : orders.length === 0
        ? <EmptyState title="Chưa có đơn hàng" description="Bạn chưa có đơn hàng nào"
            action={<Link to="/menu" className="btn-primary">Xem thực đơn</Link>} />
        : (
          <>
            <div className="space-y-3">
              {orders.map(o => (
                <Link key={o.id} to={`/customer/orders/${o.id}`}
                  className="card hover:shadow-md transition-shadow block">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <UtensilsCrossed className="h-6 w-6 text-primary-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Đơn #{o.id} — Bàn {o.tableNumber}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" /> {formatDateTime(o.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{o.items?.length || 0} món</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-500 text-lg">{formatCurrency(o.totalAmount)}</p>
                      <OrderStatusBadge status={o.status} />
                    </div>
                  </div>
                  {/* Items preview */}
                  {o.items?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                      {o.items.slice(0, 3).map(item => (
                        <span key={item.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {item.productName} ×{item.quantity}
                        </span>
                      ))}
                      {o.items.length > 3 && (
                        <span className="text-xs text-gray-400">+{o.items.length - 3} món khác</span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )
      }
    </div>
  )
}
