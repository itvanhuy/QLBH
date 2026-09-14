import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { Eye, Trash2, ChevronDown } from 'lucide-react'
import orderService from '../../services/orderService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { OrderStatusBadge } from '../../components/common/StatusBadge'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

const STATUSES = ['PENDING','CONFIRMED','COMPLETED','CANCELLED']
const NEXT_STATUS = { PENDING: 'CONFIRMED', CONFIRMED: 'COMPLETED' }

function OrderDetailModal({ order, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false)

  const advance = async () => {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    setLoading(true)
    try {
      await orderService.updateStatus(order.id, next)
      toast.success(`Chuyển sang ${next}`)
      onRefresh()
      onClose()
    } catch(err) { toast.error(err.response?.data?.message || 'Lỗi') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><span className="text-gray-500">Bàn:</span> <strong>Bàn {order.tableNumber}</strong></div>
        <div><span className="text-gray-500">Trạng thái:</span> <OrderStatusBadge status={order.status} /></div>
        <div><span className="text-gray-500">Khách:</span> {order.customerName || '—'}</div>
        <div><span className="text-gray-500">Nhân viên:</span> {order.staffName || '—'}</div>
        {order.note && <div className="col-span-2"><span className="text-gray-500">Ghi chú:</span> {order.note}</div>}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="table text-sm">
          <thead><tr><th>Món</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
          <tbody>
            {order.items?.map(item => (
              <tr key={item.id}>
                <td>{item.productName}</td>
                <td className="text-center">{item.quantity}</td>
                <td>{formatCurrency(item.price)}</td>
                <td className="font-medium">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <span className="font-bold text-gray-900">Tổng cộng:</span>
        <span className="text-xl font-bold text-primary-500">{formatCurrency(order.totalAmount)}</span>
      </div>

      {NEXT_STATUS[order.status] && (
        <div className="flex justify-end">
          <button onClick={advance} disabled={loading} className="btn-primary">
            {loading ? 'Đang xử lý...' : `Chuyển → ${NEXT_STATUS[order.status]}`}
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminOrders() {
  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [page,        setPage]        = useState(0)
  const [totalPages,  setTotalPages]  = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [viewOrder,   setViewOrder]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, size: 20 }
      if (statusFilter) params.status = statusFilter
      const r = await orderService.getAll(params)
      setOrders(r.data.data.content)
      setTotalPages(r.data.data.totalPages)
    } finally { setLoading(false) }
  }, [page, statusFilter])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    try { await orderService.delete(id); toast.success('Đã xóa'); load() }
    catch(err) { toast.error(err.response?.data?.message || 'Không thể xóa') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0) }} className="form-input w-44">
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>#</th><th>Bàn</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thời gian</th><th>Thao tác</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="font-mono text-xs text-gray-400">#{o.id}</td>
                    <td>Bàn {o.tableNumber}</td>
                    <td>{o.customerName || <span className="text-gray-400">—</span>}</td>
                    <td className="font-semibold text-primary-500">{formatCurrency(o.totalAmount)}</td>
                    <td><OrderStatusBadge status={o.status} /></td>
                    <td className="text-xs text-gray-500">{formatDateTime(o.createdAt)}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => setViewOrder(o)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteTarget(o)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title={`Chi tiết đơn #${viewOrder?.id}`} size="lg">
        {viewOrder && <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} onRefresh={load} />}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Xóa đơn hàng" danger message={`Xóa đơn hàng #${deleteTarget?.id}?`} confirmText="Xóa" />
    </div>
  )
}
