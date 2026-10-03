import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeft, CreditCard, Plus, Minus, Search } from 'lucide-react'
import orderService from '../../services/orderService'
import paymentService from '../../services/paymentService'
import tableService from '../../services/tableService'
import productService from '../../services/productService'
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
  const [transferModal, setTransferModal] = useState(false)
  const [transferTableId, setTransferTableId] = useState('')
  const [tables, setTables] = useState([])
  const [method,   setMethod]   = useState('CASH')
  const [submitting, setSubmitting] = useState(false)
  const [addMenu, setAddMenu]   = useState(false)
  const [products, setProducts] = useState([])
  const [keyword, setKeyword]   = useState('')
  const [draft, setDraft]       = useState({})

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

  useEffect(() => {
    if (!transferModal) return

    tableService.getAll().then(r => {
      const all = r.data.data || []
      const selectable = all.filter(t => t.id !== order?.tableId)
      setTables(selectable)
      setTransferTableId(selectable[0]?.id ? String(selectable[0].id) : '')
    })
  }, [transferModal, order?.tableId])

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

  useEffect(() => {
    if (!addMenu || products.length > 0) return
    productService.getAll({ status: 'AVAILABLE', size: 100 })
      .then(r => setProducts(r.data.data.content))
      .catch(() => toast.error('Không tải được thực đơn'))
  }, [addMenu])

  const draftCount = Object.values(draft).reduce((s, q) => s + q, 0)
  const draftTotal = products.reduce((s, p) => s + p.price * (draft[p.id] || 0), 0)
  const filteredProducts = products.filter(p =>
    !keyword || p.name.toLowerCase().includes(keyword.toLowerCase()))

  const setQty = (pid, qty) => setDraft(d => {
    const next = { ...d, [pid]: Math.max(0, qty) }
    if (next[pid] === 0) delete next[pid]
    return next
  })

  const handleAddItems = async () => {
    const items = Object.entries(draft).map(([productId, quantity]) => ({ productId: Number(productId), quantity }))
    if (items.length === 0) return toast.error('Chưa chọn món nào')
    setSubmitting(true)
    try {
      await orderService.addItems(id, items)
      toast.success(`Đã thêm ${items.length} món vào đơn`)
      setDraft({})
      setAddMenu(false)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Không thêm được món') }
    finally { setSubmitting(false) }
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

  const handleTransferTable = async () => {
    if (!transferTableId) {
      toast.error('Vui lòng chọn bàn mới')
      return
    }

    try {
      await orderService.transferTable(id, Number(transferTableId))
      toast.success('Chuyển bàn thành công')
      setTransferModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể chuyển bàn')
    }
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
          {order.items?.length === 0 && (
            <p className="text-sm text-gray-400 py-2">Chưa có món nào — bấm "Thêm món" khi khách gọi.</p>
          )}
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
        {/* Thêm món khi đơn còn mở (PENDING / CONFIRMED) */}
        {['PENDING','CONFIRMED'].includes(order.status) && (
          <button onClick={() => setAddMenu(m => !m)} className={addMenu ? 'btn-primary' : 'btn-outline'}>
            <Plus className="h-4 w-4" /> Thêm món
          </button>
        )}

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
          <>
            <button onClick={() => setTransferModal(true)} className="btn-outline">Chuyển bàn</button>
            <button onClick={handleCancel} className="btn-danger">Hủy đơn</button>
          </>
        )}
      </div>

      {addMenu && ['PENDING','CONFIRMED'].includes(order.status) && (
        <div className="card border-2 border-primary-200 bg-primary-50">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="font-semibold text-gray-900">Chọn món cho bàn {order.tableNumber}</h3>
            <div className="relative w-56">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Tìm món..."
                className="form-input pl-9 py-1.5 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
            {filteredProducts.map(p => {
              const qty = draft[p.id] || 0
              return (
                <div key={p.id} className="flex items-center gap-3 bg-white rounded-lg p-2">
                  <img src={p.imageUrl} alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                    onError={e => { e.target.src = 'https://placehold.co/80x80/f0f0f0/999?text=img' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(p.price)}</p>
                  </div>
                  {qty > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setQty(p.id, qty - 1)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                      <button onClick={() => setQty(p.id, qty + 1)} className="w-7 h-7 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setQty(p.id, 1)} className="w-7 h-7 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center"><Plus className="h-3.5 w-3.5" /></button>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between gap-3 mt-4">
            <p className="text-sm text-gray-600">
              Đã chọn <strong>{draftCount}</strong> món · {formatCurrency(draftTotal)}
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setAddMenu(false); setDraft({}) }} className="btn-outline">Đóng</button>
              <button onClick={handleAddItems} disabled={submitting || draftCount === 0} className="btn-primary">
                {submitting ? 'Đang lưu...' : 'Lưu vào đơn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {transferModal && (
        <div className="card border-2 border-primary-200 bg-primary-50">
          <h3 className="font-semibold text-gray-900 mb-3">Chuyển đơn sang bàn khác</h3>
          <label className="form-label">Chọn bàn mới</label>
          <select value={transferTableId} onChange={e => setTransferTableId(e.target.value)} className="form-input mb-4">
            {tables.length === 0 ? <option value="">Không có bàn khả dụng</option> : tables.map(t => (
              <option key={t.id} value={t.id}>Bàn {t.tableNumber} ({t.status})</option>
            ))}
          </select>
          <div className="flex gap-3">
            <button onClick={() => setTransferModal(false)} className="btn-outline flex-1">Hủy</button>
            <button onClick={handleTransferTable} className="btn-primary flex-1">Xác nhận</button>
          </div>
        </div>
      )}

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
