import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeft, CreditCard } from 'lucide-react'
import orderService from '../../services/orderService'
import paymentService from '../../services/paymentService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { OrderStatusBadge } from '../../components/common/StatusBadge'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

const NEXT = { PENDING: 'CONFIRMED', CONFIRMED: 'COMPLETED' }
const NEXT_LABEL = { PENDING: 'Xác nhận đơn', CONFIRMED: 'Hoàn thành' }

export default function StaffOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order,    setOrder]    = useState(null)
  const [payment,  setPayment]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [payModal, setPayModal] = useState(false)
  const [method,   setMethod]   = useState('CASH')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      const r = await orderService.getById(id)
      setOrder(r.data.data)
      // Thử lấy payment nếu có
      try {
        const p = await paymentService.getByOrderId(id)
        setPayment(p.data.data)
      } catch { setPayment(null) }
    } catch { toast.error('Không tìm thấy đơn hàng'); navigate(-1) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const handleAdvanceStatus = async () => {
    const next = NEXT[order.status]
    if (!next) return
    setSubmitting(true)
    try {
      await orderService.updateStatus(id, next)
      toast.success(`Đã chuyển sang ${next}`)
      load()
    } catch(err) { toast.error(err.response?.data?.message || 'Lỗi') }
    finally { setSubmitting(false) }
  }

  const handleCancel = async () => {
    if (!window.confirm('Hủy đơn hàng này?')) return
    try {
      await orderService.updateStatus(id, 'CANCELLED')
      toast.success('Đã hủy đơn hàng')
      load()
    } catch(err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const handleCreatePayment = async () => {
    setSubmitting(true)
    try {
      const p = await paymentService.create({ orderId: Number(id), method })
      toast.success('Tạo thanh toán thành công')
      setPayment(p.data.data)
      setPayModal(false)
      load()
    } catch(err) { toast.error(err.response?.data?.message || 'Lỗi') }
    finally { setSubmitting(false) }
  }

  const handleConfirmPayment = async () => {
    if (!payment) return
    setSubmitting(true)
    try {
      await paymentService.confirm(payment.id)
      toast.success('🎉 Thanh toán thành công!')
      load()
    } catch(err) { toast.error(err.response?.data?.message || 'Lỗi') }
    finally { setSubmitting(false) }
  }

  if (loading) return <LoadingSpinner />
  if (!order)  return null

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Đơn hàng #{order.id}</h1>
          <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Order info */}
      <div className="card grid grid-cols-2 gap-4 text-sm">
        <div><span className="text-gray-500">Bàn:</span> <strong>Bàn {order.tableNumber}</strong></div>
        <div><span className="text-gray-500">Khách:</span> {order.customerName || '—'}</div>
        <div><span className="text-gray-500">Nhân viên:</span> {order.staffName || '—'}</div>
        {order.note && <div className="col-span-2"><span className="text-gray-500">Ghi chú:</span> {order.note}</div>}
      </div>

      {/* Items */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">Danh sách món</h2>
        <div className="space-y-3">
          {order.items?.map(item => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <img src={item.productImage} alt={item.productName}
                  className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                  onError={e => { e.target.src='https://placehold.co/80x80/f0f0f0/999?text=img'}} />
                <div>
                  <p className="font-medium text-sm">{item.productName}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(item.price)} × {item.quantity}</p>
                </div>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-2">
          <span className="font-bold text-gray-900 text-lg">Tổng cộng</span>
          <span className="text-2xl font-bold text-primary-500">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      {/* Payment section */}
      {payment && (
        <div className="card border-2 border-green-200 bg-green-50">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" /> Thông tin thanh toán
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-gray-500">Số tiền:</span> <strong>{formatCurrency(payment.amount)}</strong></div>
            <div><span className="text-gray-500">Phương thức:</span> <strong>{payment.method}</strong></div>
            <div><span className="text-gray-500">Trạng thái:</span>
              <span className={`ml-1 font-semibold ${payment.status==='PAID'?'text-green-600':'text-yellow-600'}`}>{payment.status}</span>
            </div>
            {payment.paidAt && <div><span className="text-gray-500">Thanh toán lúc:</span> {formatDateTime(payment.paidAt)}</div>}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Advance status */}
        {NEXT[order.status] && (
          <button onClick={handleAdvanceStatus} disabled={submitting} className="btn-primary">
            {NEXT_LABEL[order.status]}
          </button>
        )}

        {/* Create payment (chỉ khi CONFIRMED và chưa có payment) */}
        {order.status === 'CONFIRMED' && !payment && (
          <button onClick={() => setPayModal(true)} className="btn-success">
            <CreditCard className="h-4 w-4" /> Tạo thanh toán
          </button>
        )}

        {/* Confirm payment (khi payment PENDING) */}
        {payment?.status === 'PENDING' && (
          <button onClick={handleConfirmPayment} disabled={submitting} className="btn-success">
            ✅ Xác nhận đã thu tiền
          </button>
        )}

        {/* Cancel (chỉ PENDING / CONFIRMED) */}
        {['PENDING','CONFIRMED'].includes(order.status) && (
          <button onClick={handleCancel} className="btn-danger">Hủy đơn</button>
        )}
      </div>

      {/* Payment method modal (inline) */}
      {payModal && (
        <div className="card border-2 border-primary-200 bg-primary-50">
          <h3 className="font-semibold text-gray-900 mb-3">Chọn phương thức thanh toán</h3>
          <div className="flex gap-3 mb-4">
            {['CASH','BANKING'].map(m => (
              <button key={m} onClick={() => setMethod(m)}
                className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-colors
                  ${method===m ? 'border-primary-500 bg-white text-primary-600' : 'border-gray-200 bg-white text-gray-600'}`}>
                {m === 'CASH' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setPayModal(false)} className="btn-outline flex-1">Hủy</button>
            <button onClick={handleCreatePayment} disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
