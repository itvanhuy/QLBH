import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeft } from 'lucide-react'
import orderService from '../../services/orderService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { OrderStatusBadge } from '../../components/common/StatusBadge'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

export default function CustomerOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getById(id)
      .then(r => setOrder(r.data.data))
      .catch(() => { toast.error('Không tìm thấy đơn hàng'); navigate(-1) })
      .finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
    try {
      await orderService.updateStatus(id, 'CANCELLED')
      toast.success('Đã hủy đơn hàng')
      setOrder(o => ({ ...o, status: 'CANCELLED' }))
    } catch(err) { toast.error(err.response?.data?.message || 'Không thể hủy') }
  }

  if (loading) return <LoadingSpinner />
  if (!order)  return null

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Đơn hàng #{order.id}</h1>
          <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status tracker */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Trạng thái đơn hàng</h2>
        <div className="flex items-center">
          {['PENDING','CONFIRMED','COMPLETED'].map((s, i) => {
            const statusOrder = ['PENDING','CONFIRMED','COMPLETED','CANCELLED']
            const currentIdx  = statusOrder.indexOf(order.status)
            const stepIdx     = statusOrder.indexOf(s)
            const done        = order.status !== 'CANCELLED' && currentIdx >= stepIdx
            const labels = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đang phục vụ', COMPLETED: 'Hoàn thành' }

            return (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                  ${done ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {done ? '✓' : i + 1}
                </div>
                <div className="ml-2 flex-1">
                  <p className={`text-xs font-medium ${done ? 'text-primary-600' : 'text-gray-400'}`}>
                    {labels[s]}
                  </p>
                </div>
                {i < 2 && <div className={`h-0.5 flex-1 mx-2 ${done && currentIdx > stepIdx ? 'bg-primary-500' : 'bg-gray-200'}`} />}
              </div>
            )
          })}
        </div>
        {order.status === 'CANCELLED' && (
          <p className="mt-3 text-sm text-red-500 text-center font-medium">❌ Đơn hàng đã bị hủy</p>
        )}
      </div>

      {/* Order info */}
      <div className="card">
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div><span className="text-gray-500">Bàn:</span> <strong>Bàn {order.tableNumber}</strong></div>
          <div><span className="text-gray-500">Nhân viên:</span> {order.staffName || '—'}</div>
          {order.note && <div className="col-span-2"><span className="text-gray-500">Ghi chú:</span> {order.note}</div>}
        </div>

        <h2 className="font-semibold text-gray-900 mb-3 border-t border-gray-100 pt-3">Danh sách món</h2>
        <div className="space-y-3">
          {order.items?.map(item => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={item.productImage} alt={item.productName}
                  className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                  onError={e => { e.target.src='https://placehold.co/80x80/f0f0f0/999?text=img'}} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(item.price)} × {item.quantity}</p>
                </div>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
          <span className="font-bold text-gray-900">Tổng cộng</span>
          <span className="text-2xl font-bold text-primary-500">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      {/* Cancel button - chỉ khi PENDING */}
      {order.status === 'PENDING' && (
        <button onClick={handleCancel} className="btn-danger w-full">Hủy đơn hàng</button>
      )}
    </div>
  )
}
