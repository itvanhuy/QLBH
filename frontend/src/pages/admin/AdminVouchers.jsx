import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Plus, Edit2, Trash2, Percent, Ticket } from 'lucide-react'
import voucherService from '../../services/voucherService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

const emptyForm = {
  code: '',
  name: '',
  description: '',
  type: 'PERCENT',
  value: '',
  minOrderAmount: '0',
  maxDiscountAmount: '',
  isActive: true,
  startAt: '',
  endAt: '',
  usageLimit: '0',
}

function VoucherForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.code.trim()) return toast.error('Mã giảm giá không được để trống')
    if (!form.name.trim()) return toast.error('Tên mã giảm giá không được để trống')
    if (!form.type) return toast.error('Vui lòng chọn loại mã')
    if (!form.value || Number(form.value) <= 0) return toast.error('Giá trị giảm phải lớn hơn 0')

    setLoading(true)
    try {
      const payload = {
        code: form.code,
        name: form.name,
        description: form.description,
        type: form.type,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount || 0),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        isActive: form.isActive,
        startAt: form.startAt || null,
        endAt: form.endAt || null,
        usageLimit: Number(form.usageLimit || 0),
      }

      if (initial) {
        await voucherService.update(initial.id, payload)
        toast.success('Cập nhật mã giảm giá thành công')
      } else {
        await voucherService.create(payload)
        toast.success('Thêm mã giảm giá thành công')
      }
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Mã giảm giá</label>
          <input className="form-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="SAVE10" />
        </div>
        <div>
          <label className="form-label">Tên</label>
          <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Giảm 10%" />
        </div>
      </div>

      <div>
        <label className="form-label">Mô tả</label>
        <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Loại</label>
          <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="PERCENT">Phần trăm</option>
            <option value="FIXED">Cố định</option>
          </select>
        </div>
        <div>
          <label className="form-label">Giá trị</label>
          <input className="form-input" type="number" min="0" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Đơn tối thiểu</label>
          <input className="form-input" type="number" min="0" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Giảm tối đa</label>
          <input className="form-input" type="number" min="0" value={form.maxDiscountAmount} onChange={e => setForm({ ...form, maxDiscountAmount: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Bắt đầu</label>
          <input className="form-input" type="datetime-local" value={form.startAt ? form.startAt.slice(0, 16) : ''} onChange={e => setForm({ ...form, startAt: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Kết thúc</label>
          <input className="form-input" type="datetime-local" value={form.endAt ? form.endAt.slice(0, 16) : ''} onChange={e => setForm({ ...form, endAt: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Giới hạn lượt</label>
          <input className="form-input" type="number" min="0" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
            Hoạt động
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-outline">Hủy</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Đang lưu...' : (initial ? 'Cập nhật' : 'Thêm')}</button>
      </div>
    </form>
  )
}

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await voucherService.getAll()
      setVouchers(res.data.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tải mã giảm giá')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    try {
      await voucherService.delete(id)
      toast.success('Xóa mã giảm giá thành công')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mã giảm giá</h1>
          <p className="text-sm text-gray-500">Quản lý voucher khuyến mãi cho đơn hàng</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary">
          <Plus className="h-4 w-4" /> Thêm mã
        </button>
      </div>

      {loading ? <LoadingSpinner /> : vouchers.length === 0 ? (
        <div className="card text-center py-10">
          <Ticket className="h-10 w-10 mx-auto text-gray-300" />
          <p className="mt-3 text-gray-500">Chưa có mã giảm giá nào</p>
          <button onClick={() => setModal('create')} className="btn-primary mt-4">Thêm mã mới</button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Điều kiện</th>
                <th>Hiệu lực</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map(v => (
                <tr key={v.id}>
                  <td className="font-mono font-semibold text-primary-600">{v.code}</td>
                  <td>{v.name}</td>
                  <td><span className="badge badge-blue">{v.type === 'PERCENT' ? 'Phần trăm' : 'Cố định'}</span></td>
                  <td>{v.type === 'PERCENT' ? `${v.value}%` : formatCurrency(v.value)}</td>
                  <td className="text-sm text-gray-500">
                    {v.minOrderAmount ? `Từ ${formatCurrency(v.minOrderAmount)}` : 'Không có'}
                    {v.maxDiscountAmount ? ` • tối đa ${formatCurrency(v.maxDiscountAmount)}` : ''}
                  </td>
                  <td className="text-xs text-gray-500">
                    {v.isActive ? 'Đang hoạt động' : 'Tắt'}<br />
                    {v.startAt ? formatDateTime(v.startAt) : 'Không giới hạn'}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setModal(v)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteTarget(v)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Thêm mã giảm giá' : 'Sửa mã giảm giá'} size="lg">
        {modal && <VoucherForm initial={modal === 'create' ? null : modal} onSave={() => { setModal(null); load() }} onCancel={() => setModal(null)} />}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => handleDelete(deleteTarget?.id)} title="Xóa mã giảm giá" danger message={`Bạn có chắc muốn xóa mã "${deleteTarget?.name}"?`} confirmText="Xóa" />
    </div>
  )
}
