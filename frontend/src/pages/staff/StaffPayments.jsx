import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { CreditCard, Eye } from 'lucide-react'
import orderService from '../../services/orderService'
import paymentService from '../../services/paymentService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { PaymentStatusBadge, OrderStatusBadge } from '../../components/common/StatusBadge'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

export default function StaffPayments() {
  // Hiển thị các order CONFIRMED (chờ thanh toán)
  const [orders,     setOrders]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [processing, setProcessing] = useState(null)
  const [method,     setMethod]     = useState({}) // {orderId: 'CASH'|'BANKING'}

  const load = () => {
    setLoading(true)
    orderService.getAll({ page: 0, size: 50, status: 'CONFIRMED' })
      .then(r => setOrders(r.data.data.content))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handlePayment = async (order) => {
    const m = method[order.id] || 'CASH'
    setProcessing(order.id)
    try {
      // Tạo payment
      const p = await paymentService.create({ orderId: order.id, method: m })
      // Xác nhận ngay
      await paymentService.confirm(p.data.data.id)
      toast.success(`🎉 Thanh toán bàn ${order.tableNumber} thành công!`)
      load()
    } catch(err) { toast.error(err.response?.data?.message || 'Lỗi thanh toán') }
    finally { setProcessing(null) }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
        <p className="text-sm text-gray-500 mt-1">Các đơn hàng đang chờ thanh toán</p>
      </div>

      {loading ? <LoadingSpinner /> : orders.length === 0
        ? <EmptyState title="Không có đơn chờ thanh toán" description="Tất cả đơn hàng đã được xử lý" />
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {orders.map(o => (
              <div key={o.id} className="card border-2 border-primary-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">Bàn {o.tableNumber}</p>
                    <p className="text-xs text-gray-500">#{o.id} · {formatDateTime(o.createdAt)}</p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </div>

                {/* Items summary */}
                <div className="space-y-1.5 mb-3 max-h-32 overflow-y-auto">
                  {o.items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700 truncate flex-1 mr-2">
                        {item.productName} <span className="text-gray-400">×{item.quantity}</span>
                      </span>
                      <span className="font-medium text-gray-900 whitespace-nowrap">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-2 border-t border-dashed border-gray-200">
                  <span className="text-sm text-gray-600">Tổng cộng</span>
                  <span className="font-bold text-primary-500 text-xl">{formatCurrency(o.totalAmount)}</span>
                </div>

                {/* Payment method */}
                <div className="flex gap-2 mt-3">
                  {['CASH','BANKING'].map(m => (
                    <button key={m} onClick={() => setMethod(prev => ({ ...prev, [o.id]: m }))}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                        ${(method[o.id] || 'CASH') === m
                          ? 'border-primary-500 bg-primary-50 text-primary-600'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {m === 'CASH' ? '💵 Tiền mặt' : '🏦 CK'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePayment(o)}
                  disabled={processing === o.id}
                  className="btn-success w-full mt-3">
                  <CreditCard className="h-4 w-4" />
                  {processing === o.id ? 'Đang xử lý...' : 'Thu tiền & Hoàn tất'}
                </button>

                <Link to={`/staff/orders/${o.id}`} className="btn-outline w-full mt-2 text-center text-sm">
                  Xem chi tiết
                </Link>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
