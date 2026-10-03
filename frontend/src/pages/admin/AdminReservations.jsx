import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { Eye, CalendarDays, Clock, Users, CheckCircle, XCircle, UtensilsCrossed, LogIn, UserX } from 'lucide-react'
import reservationService from '../../services/reservationService'
import tableService       from '../../services/tableService'
import LoadingSpinner     from '../../components/common/LoadingSpinner'
import Pagination         from '../../components/common/Pagination'
import Modal              from '../../components/common/Modal'
import ConfirmDialog      from '../../components/common/ConfirmDialog'
import { ReservationStatusBadge } from '../../components/common/StatusBadge'
import { RESERVATION_STATUS } from '../../utils/constants'
import { formatDateTime, formatDate } from '../../utils/formatters'

const STATUSES = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

function ReservationDetailModal({ reservation }) {
  if (!reservation) return null
  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <div><span className="text-gray-500">Mã đặt bàn:</span> <strong className="font-mono">#{reservation.id}</strong></div>
        <div><span className="text-gray-500">Trạng thái:</span> <ReservationStatusBadge status={reservation.status} /></div>
        <div><span className="text-gray-500">Khách hàng:</span> <strong>{reservation.customerName}</strong></div>
        <div><span className="text-gray-500">SĐT:</span> <span className="font-mono">{reservation.customerPhone || '—'}</span></div>
        <div className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-gray-400" />{formatDate(reservation.reservationDate)}</div>
        <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gray-400" />{reservation.reservationTime?.slice(0, 5)}</div>
        <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-gray-400" />{reservation.guestCount} người</div>
        <div className="flex items-center gap-1.5">
          <UtensilsCrossed className="h-3.5 w-3.5 text-gray-400" />
          {reservation.tableNumber ? <>Bàn {reservation.tableNumber}</> : <span className="text-gray-400">Chưa gán bàn</span>}
        </div>
        {reservation.orderId && (
          <div className="col-span-2 flex items-center gap-1.5 text-primary-600">
            <UtensilsCrossed className="h-3.5 w-3.5" />
            Đơn hàng liên kết: <strong className="font-mono">#{reservation.orderId}</strong>
          </div>
        )}
      </div>
      {reservation.note && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Yêu cầu đặc biệt:</p>
          <p className="text-gray-800 italic">"{reservation.note}"</p>
        </div>
      )}
      <div className="text-xs text-gray-400">Tạo lúc: {formatDateTime(reservation.createdAt)}</div>
    </div>
  )
}

function AssignTableModal({ isOpen, onClose, onConfirm, target }) {
  const [tables, setTables] = useState([])
  const [tableId, setTableId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      setTableId(target?.tableId || '')
      tableService.getAll()
        .then(r => setTables(r.data.data.filter(t => t.status === 'AVAILABLE' || (target && String(t.id) === String(target.tableId)))))
        .catch(() => toast.error('Không tải được danh sách bàn'))
        .finally(() => setLoading(false))
    }
  }, [isOpen, target])

  if (!isOpen || !target) return null
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Gán bàn cho đặt bàn #${target.id}`} size="md">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
          <strong>Yêu cầu:</strong> {target.customerName} · {formatDate(target.reservationDate)} {target.reservationTime?.slice(0,5)} · {target.guestCount} người
        </div>
        <div>
          <label className="form-label">Chọn bàn</label>
          {loading ? <LoadingSpinner /> : (
            <select value={tableId} onChange={e => setTableId(e.target.value)} className="form-input" disabled={loading}>
              <option value="">-- Chọn bàn --</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>
                  Bàn {t.tableNumber} · {t.capacity} người · {t.status === 'AVAILABLE' ? 'Trống' : 'Đang xếp cho khách này'}
                </option>
              ))}
            </select>
          )}
          {tables.length === 0 && !loading && <p className="text-xs text-red-500 mt-1">⚠ Không có bàn trống</p>}
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="btn-outline">Hủy</button>
          <button type="button" disabled={!tableId} onClick={() => onConfirm(target.id, tableId)} className="btn-primary">
            <CheckCircle className="h-4 w-4" /> Xác nhận + Gán bàn
          </button>
        </div>
      </div>
    </Modal>
  )
}

function CheckInModal({ isOpen, onClose, onConfirm, target }) {
  const [tables, setTables] = useState([])
  const [tableId, setTableId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      setTableId(target?.tableId || '')
      tableService.getAll()
        .then(r => setTables(r.data.data.filter(t => t.status === 'AVAILABLE' || (target && String(t.id) === String(target.tableId)))))
        .catch(() => toast.error('Không tải được danh sách bàn'))
        .finally(() => setLoading(false))
    }
  }, [isOpen, target])

  if (!isOpen || !target) return null
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Đón khách — Đặt bàn #${target.id}`} size="md">
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
          <strong>{target.customerName}</strong> · {formatDate(target.reservationDate)} {target.reservationTime?.slice(0,5)} · {target.guestCount} người
          {target.tableNumber && <> · đã xếp <strong>Bàn {target.tableNumber}</strong></>}
        </div>
        <div>
          <label className="form-label">Bàn (có thể đổi nếu khách muốn)</label>
          {loading ? <LoadingSpinner /> : (
            <select value={tableId} onChange={e => setTableId(e.target.value)} className="form-input" disabled={loading}>
              <option value="">-- Chọn bàn --</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>
                  Bàn {t.tableNumber} · {t.capacity} người · {t.status === 'AVAILABLE' ? 'Trống' : 'Đang xếp cho khách này'}
                </option>
              ))}
            </select>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Khi đón khách: bàn chuyển thành "Có khách" và hệ thống <strong>tự tạo một đơn hàng trống</strong> để gọi món.
          Sau khi khách thanh toán, đặt bàn sẽ tự hoàn tất.
        </p>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="btn-outline">Hủy</button>
          <button type="button" disabled={!tableId} onClick={() => onConfirm(target.id, tableId)} className="btn-primary">
            <LogIn className="h-4 w-4" /> Đón khách
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function AdminReservations() {
  const [reservations,  setReservations]  = useState([])
  const [loading,       setLoading]       = useState(true)
  const [page,          setPage]          = useState(0)
  const [totalPages,    setTotalPages]    = useState(0)
  const [statusFilter,  setStatusFilter]  = useState('')
  const [dateFilter,    setDateFilter]    = useState('')
  const [viewTarget,    setViewTarget]    = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [checkInTarget, setCheckInTarget] = useState(null)
  const [cancelTarget,  setCancelTarget]  = useState(null)
  const [noShowTarget,  setNoShowTarget]  = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, size: 20 }
      if (statusFilter) params.status = statusFilter
      if (dateFilter)   params.date   = dateFilter
      const r = await reservationService.getAll(params)
      setReservations(r.data.data.content)
      setTotalPages(r.data.data.totalPages)
    } finally { setLoading(false) }
  }, [page, statusFilter, dateFilter])

  useEffect(() => { load() }, [load])

  const doConfirm = async (id, tblId) => {
    try {
      await reservationService.updateStatus(id, { status: 'CONFIRMED', tableId: Number(tblId) })
      toast.success('Đã xác nhận đặt bàn và gán bàn')
      setConfirmTarget(null)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const doCheckIn = async (id, tblId) => {
    try {
      await reservationService.checkIn(id, { tableId: Number(tblId) })
      toast.success('Đã đón khách — đơn hàng được tạo tự động')
      setCheckInTarget(null)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const doCancel = async (id) => {
    try {
      await reservationService.updateStatus(id, { status: 'CANCELLED' })
      toast.success('Đã hủy đặt bàn')
      setCancelTarget(null)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  const doNoShow = async (id) => {
    try {
      await reservationService.updateStatus(id, { status: 'NO_SHOW' })
      toast.success('Đã đánh dấu khách không đến')
      setNoShowTarget(null)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đặt bàn</h1>
          <p className="text-sm text-gray-500 mt-0.5">Xác nhận đặt bàn, xếp bàn và đón khách</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(0) }}
            className="form-input w-auto" />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0) }} className="form-input w-44">
            <option value="">Tất cả trạng thái</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{RESERVATION_STATUS[s]?.label || s}</option>
            ))}
          </select>
          {(dateFilter || statusFilter) && (
            <button onClick={() => { setDateFilter(''); setStatusFilter(''); setPage(0) }} className="btn-outline">
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : reservations.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có đặt bàn nào</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Khách hàng</th>
                  <th>Ngày</th>
                  <th>Giờ</th>
                  <th>SL</th>
                  <th>Bàn</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(r => (
                  <tr key={r.id}>
                    <td className="font-mono text-xs text-gray-400">#{r.id}</td>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">{r.customerName}</p>
                        <p className="text-xs text-gray-500 font-mono">{r.customerPhone || '—'}</p>
                      </div>
                    </td>
                    <td>{formatDate(r.reservationDate)}</td>
                    <td>{r.reservationTime?.slice(0, 5)}</td>
                    <td>{r.guestCount} người</td>
                    <td>{r.tableNumber ? <span className="font-semibold">Bàn {r.tableNumber}</span> : <span className="text-gray-400">—</span>}</td>
                    <td><ReservationStatusBadge status={r.status} /></td>
                    <td className="text-xs text-gray-500">{formatDateTime(r.createdAt)}</td>
                    <td>
                      <div className="flex gap-1 items-center justify-center">
                        <button onClick={() => setViewTarget(r)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500" title="Xem chi tiết">
                          <Eye className="h-4 w-4" />
                        </button>
                        {r.status === 'PENDING' && (
                          <button onClick={() => setConfirmTarget(r)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Xác nhận + Gán bàn">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {r.status === 'CONFIRMED' && (
                          <>
                            <button onClick={() => setCheckInTarget(r)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600" title="Đón khách (tạo đơn hàng)">
                              <LogIn className="h-4 w-4" />
                            </button>
                            <button onClick={() => setNoShowTarget(r)} className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500" title="Khách không đến">
                              <UserX className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                          <button onClick={() => setCancelTarget(r)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Hủy">
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        {r.status === 'CHECKED_IN' && r.orderId && (
                          <span className="text-xs text-gray-500 whitespace-nowrap">Đơn <strong className="font-mono">#{r.orderId}</strong></span>
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
      )}

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title={`Chi tiết đặt bàn #${viewTarget?.id}`} size="md">
        <ReservationDetailModal reservation={viewTarget} />
      </Modal>

      <AssignTableModal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={doConfirm}
        target={confirmTarget}
      />

      <CheckInModal
        isOpen={!!checkInTarget}
        onClose={() => setCheckInTarget(null)}
        onConfirm={doCheckIn}
        target={checkInTarget}
      />

      <ConfirmDialog isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)}
        onConfirm={() => doCancel(cancelTarget?.id)} title="Hủy đặt bàn" danger
        message={`Hủy đặt bàn #${cancelTarget?.id} của ${cancelTarget?.customerName}? Hành động này không thể hoàn tác.`}
        confirmText="Hủy đặt bàn" />

      <ConfirmDialog isOpen={!!noShowTarget} onClose={() => setNoShowTarget(null)}
        onConfirm={() => doNoShow(noShowTarget?.id)} title="Khách không đến" danger
        message={`Đánh dấu đặt bàn #${noShowTarget?.id} (${noShowTarget?.customerName}) là khách không đến? Hành động này không thể hoàn tác.`}
        confirmText="Đánh dấu không đến" />
    </div>
  )
}
