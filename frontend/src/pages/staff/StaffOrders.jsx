import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Eye, Plus } from 'lucide-react'
import orderService from '../../services/orderService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import EmptyState from '../../components/common/EmptyState'
import { OrderStatusBadge } from '../../components/common/StatusBadge'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

const STATUSES = ['PENDING','CONFIRMED','COMPLETED','CANCELLED']

export default function StaffOrders() {
  const [orders,       setOrders]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [page,         setPage]         = useState(0)
  const [totalPages,   setTotalPages]   = useState(0)
  const [statusFilter, setStatusFilter] = useState('')

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

  const handleQuickStatus = async (id, status) => {
    try {
      await orderService.updateStatus(id, status)
      toast.success('Cập nhật trạng thái thành công')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
        <Link to="/staff/orders/create" className="btn-primary">
          <Plus className="h-4 w-4" /> Tạo đơn mới
        </Link>
      </div>

      {/* Status filter tabs */}
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
        ? <EmptyState title="Không có đơn hàng" description="Chưa có đơn hàng nào ở trạng thái này" />
        : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>#</th><th>Bàn</th><th>Khách</th><th>Nhân viên</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thời gian</th><th>Thao tác</th></tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="font-mono text-xs text-gray-400">#{o.id}</td>
                      <td className="font-medium">Bàn {o.tableNumber}</td>
                      <td className="text-gray-600">{o.customerName || <span className="text-gray-400">—</span>}</td>
                      <td className="text-gray-600">{o.staffName || <span className="text-gray-400">—</span>}</td>
                      <td className="font-semibold text-primary-500">{formatCurrency(o.totalAmount)}</td>
                      <td><OrderStatusBadge status={o.status} /></td>
                      <td className="text-xs text-gray-500">{formatDateTime(o.createdAt)}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Link to={`/staff/orders/${o.id}`}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500">
                            <Eye className="h-4 w-4" />
                          </Link>
                          {o.status === 'PENDING' && (
                            <button onClick={() => handleQuickStatus(o.id, 'CONFIRMED')}
                              className="btn-success btn-sm">Xác nhận</button>
                          )}
                          {o.status === 'CONFIRMED' && (
                            <Link to={`/staff/payments`}
                              className="btn-primary btn-sm">Thanh toán</Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )
      }
    </div>
  )
}
