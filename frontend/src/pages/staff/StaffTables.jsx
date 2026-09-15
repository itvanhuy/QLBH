import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { Users, Plus } from 'lucide-react'
import tableService from '../../services/tableService'
import orderService from '../../services/orderService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import { TableStatusBadge } from '../../components/common/StatusBadge'
import { formatCurrency } from '../../utils/formatters'

const STATUS_OPTS = ['AVAILABLE','OCCUPIED','RESERVED']

export default function StaffTables() {
  const [tables,  setTables]  = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null) // table obj to change status
  const [activeOrder, setActiveOrder] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    tableService.getAll().then(r => setTables(r.data.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openTableDetail = async (table) => {
    setModal(table)
    setActiveOrder(null)

    if (table.status !== 'OCCUPIED') return

    try {
      setDetailLoading(true)
      const res = await orderService.getActiveByTableId(table.id)
      setActiveOrder(res.data.data)
    } catch {
      setActiveOrder(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleChangeStatus = async (id, status) => {
    try {
      await tableService.updateStatus(id, status)
      toast.success('Cập nhật trạng thái thành công')
      setModal(null)
      load()
    } catch(err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý bàn ăn</h1>
        <button onClick={() => navigate('/staff/orders/create')} className="btn-primary">
          <Plus className="h-4 w-4" /> Tạo đơn mới
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {[
          { label: 'Trống',        color: 'bg-green-100 border-green-300'  },
          { label: 'Có khách',     color: 'bg-red-100 border-red-300'      },
          { label: 'Đã đặt trước', color: 'bg-yellow-100 border-yellow-300' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border-2 ${l.color}`} />
            <span className="text-gray-600">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Table grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map(t => (
          <div key={t.id}
            onClick={() => openTableDetail(t)}
            className={`card-sm cursor-pointer hover:shadow-md transition-all border-2 select-none
              ${t.status==='AVAILABLE' ? 'border-green-200 hover:border-green-400' :
                t.status==='OCCUPIED'  ? 'border-red-200 hover:border-red-400' :
                                         'border-yellow-200 hover:border-yellow-400'}`}>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">BÀN</p>
              <p className="text-3xl font-black text-primary-500">{t.tableNumber}</p>
              <div className="flex items-center justify-center gap-1 text-sm text-gray-500 my-2">
                <Users className="h-4 w-4" />
                <span>{t.capacity} người</span>
              </div>
              <TableStatusBadge status={t.status} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center">Nhấn vào bàn để thay đổi trạng thái</p>

      {/* Change status modal */}
      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={`Bàn ${modal?.tableNumber}`} size="sm">
        {modal && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Trạng thái hiện tại: <TableStatusBadge status={modal.status} />
            </p>

            {detailLoading ? (
              <p className="text-sm text-gray-500">Đang tải đơn hàng...</p>
            ) : activeOrder ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Đơn hàng #{activeOrder.id}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">{activeOrder.status}</span>
                </div>
                <p className="text-gray-600">Khách: {activeOrder.customerName || '—'}</p>
                <p className="text-gray-600">Món: {activeOrder.items?.length || 0} món</p>
                <p className="text-gray-600">Tổng: {formatCurrency(activeOrder.totalAmount)}</p>
                <button onClick={() => navigate(`/staff/orders/${activeOrder.id}`)} className="btn-primary w-full mt-2">
                  Xem chi tiết đơn
                </button>
              </div>
            ) : (
              modal.status === 'OCCUPIED' && (
                <p className="text-sm text-gray-500">Bàn đang có khách nhưng không tìm thấy đơn hàng đang hoạt động.</p>
              )
            )}

            <p className="text-sm font-medium text-gray-700">Chuyển sang:</p>
            {STATUS_OPTS.filter(s => s !== modal.status).map(s => (
              <button key={s} onClick={() => handleChangeStatus(modal.id, s)}
                className={`w-full py-3 rounded-lg border-2 font-medium text-sm transition-colors
                  ${s==='AVAILABLE' ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100' :
                    s==='OCCUPIED'  ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' :
                                      'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}>
                {s === 'AVAILABLE' ? '✅ Trống' : s === 'OCCUPIED' ? '🔴 Có khách' : '🟡 Đã đặt trước'}
              </button>
            ))}
            <button onClick={() => setModal(null)} className="btn-outline w-full mt-2">Hủy</button>
          </div>
        )}
      </Modal>
    </div>
  )
}
