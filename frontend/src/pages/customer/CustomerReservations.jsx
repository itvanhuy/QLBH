import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { CalendarDays, Clock, Users, Plus, X } from 'lucide-react'
import reservationService from '../../services/reservationService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Pagination from '../../components/common/Pagination'
import EmptyState from '../../components/common/EmptyState'
import { ReservationStatusBadge } from '../../components/common/StatusBadge'
import { formatDateTime } from '../../utils/formatters'

const TIME_SLOTS = ['11:00','11:30','12:00','12:30','13:00','13:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30']

function ReservationForm({ onSave, onCancel }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ guestCount: 2, reservationDate: '', reservationTime: '18:00', note: '' })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.reservationDate) return toast.error('Vui lòng chọn ngày')
    setLoading(true)
    try {
      await reservationService.create(form)
      toast.success('Đặt bàn thành công! Chúng tôi sẽ xác nhận sớm.')
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đặt bàn')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="form-label">Ngày đặt <span className="text-red-500">*</span></label>
          <input type="date" min={today} value={form.reservationDate}
            onChange={e => set('reservationDate', e.target.value)} className="form-input" required />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="form-label">Giờ đặt <span className="text-red-500">*</span></label>
          <select value={form.reservationTime} onChange={e => set('reservationTime', e.target.value)} className="form-input">
            {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="form-label">Số người <span className="text-red-500">*</span></label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => set('guestCount', Math.max(1, form.guestCount - 1))}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-lg">−</button>
            <span className="text-2xl font-bold text-gray-900 w-10 text-center">{form.guestCount}</span>
            <button type="button" onClick={() => set('guestCount', Math.min(20, form.guestCount + 1))}
              className="w-9 h-9 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center font-bold text-lg text-primary-700">+</button>
            <span className="text-sm text-gray-500">người</span>
          </div>
        </div>
        <div className="col-span-2">
          <label className="form-label">Yêu cầu đặc biệt</label>
          <textarea rows={3} value={form.note} onChange={e => set('note', e.target.value)}
            placeholder="Sinh nhật, dị ứng thực phẩm, không gian riêng tư..." className="form-input" />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
        <strong>Lưu ý:</strong> Đặt bàn cần được xác nhận bởi nhân viên. Chúng tôi sẽ liên hệ xác nhận trong vòng 30 phút.
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-outline flex-1">Hủy</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Đang gửi...' : 'Xác nhận đặt bàn'}
        </button>
      </div>
    </form>
  )
}

export default function CustomerReservations() {
  const [reservations, setReservations] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [page,         setPage]         = useState(0)
  const [totalPages,   setTotalPages]   = useState(0)
  const [showForm,     setShowForm]     = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await reservationService.getMy({ page, size: 10 })
      setReservations(r.data.data.content)
      setTotalPages(r.data.data.totalPages)
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  const handleCancel = async (id) => {
    try {
      await reservationService.cancel(id)
      toast.success('Đã hủy đặt bàn')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Không thể hủy') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đặt bàn trước</h1>
          <p className="text-sm text-gray-500 mt-0.5">Đặt bàn trước để đảm bảo chỗ ngồi</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Đặt bàn mới
        </button>
      </div>

      {/* Hướng dẫn */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: CalendarDays, title: 'Chọn ngày & giờ', desc: 'Chọn ngày giờ phù hợp với bạn' },
          { icon: Users,        title: 'Số người',         desc: 'Cho chúng tôi biết bao nhiêu người' },
          { icon: Clock,        title: 'Xác nhận nhanh',   desc: 'Nhân viên xác nhận trong 30 phút' },
        ].map(s => (
          <div key={s.title} className="card-sm flex items-start gap-3">
            <div className="p-2 bg-primary-50 rounded-lg flex-shrink-0">
              <s.icon className="h-5 w-5 text-primary-500" />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900">{s.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Danh sách đặt bàn */}
      {loading ? <LoadingSpinner /> : reservations.length === 0
        ? (
          <EmptyState title="Chưa có đặt bàn nào"
            description="Hãy đặt bàn trước để đảm bảo chỗ ngồi tốt nhất"
            action={<button onClick={() => setShowForm(true)} className="btn-primary">Đặt bàn ngay</button>} />
        ) : (
          <div className="space-y-3">
            {reservations.map(r => (
                <div key={r.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-primary-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xl font-black text-primary-500">{r.reservationDate?.split('-')[2]}</span>
                        <span className="text-xs text-primary-400 font-medium">
                          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(r.reservationDate?.split('-')[1]) - 1]}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">Đặt bàn #{r.id}</span>
                          <ReservationStatusBadge status={r.status} />
                        </div>
                        <div className="flex flex-wrap gap-4 mt-1.5 text-sm text-gray-600">
                          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gray-400" />{r.reservationTime?.slice(0,5)}</span>
                          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-gray-400" />{r.guestCount} người</span>
                          {r.tableNumber && <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-gray-400" />Bàn {r.tableNumber}</span>}
                          {r.orderId && (
                            <Link to={`/customer/orders/${r.orderId}`} className="flex items-center gap-1.5 text-primary-600 hover:underline">
                              Đơn hàng #{r.orderId}
                            </Link>
                          )}
                        </div>
                        {r.note && <p className="text-xs text-gray-500 mt-1.5 italic">"{r.note}"</p>}
                        <p className="text-xs text-gray-400 mt-1">{formatDateTime(r.createdAt)}</p>
                      </div>
                    </div>
                    {['PENDING', 'CONFIRMED'].includes(r.status) && (
                      <button onClick={() => setCancelTarget(r)}
                        className="flex-shrink-0 p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
            ))}
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )
      }

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Đặt bàn trước" size="md">
        <ReservationForm onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)}
        onConfirm={() => handleCancel(cancelTarget?.id)} title="Hủy đặt bàn" danger
        message={`Hủy đặt bàn ngày ${cancelTarget?.reservationDate} lúc ${cancelTarget?.reservationTime?.slice(0,5)}?`}
        confirmText="Hủy đặt bàn" />
    </div>
  )
}
