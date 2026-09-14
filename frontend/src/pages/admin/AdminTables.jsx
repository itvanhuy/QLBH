import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Plus, Edit2, Trash2, Users } from 'lucide-react'
import tableService from '../../services/tableService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { TableStatusBadge } from '../../components/common/StatusBadge'

function TableForm({ initial, onSave, onCancel }) {
  const [tableNumber, setTableNumber] = useState(initial?.tableNumber || '')
  const [capacity,    setCapacity]    = useState(initial?.capacity || 4)
  const [loading,     setLoading]     = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!tableNumber) return toast.error('Số bàn không được để trống')
    setLoading(true)
    try {
      if (initial) { await tableService.update(initial.id, { tableNumber, capacity: Number(capacity) }); toast.success('Cập nhật thành công') }
      else         { await tableService.create({ tableNumber, capacity: Number(capacity) }); toast.success('Thêm bàn thành công') }
      onSave()
    } catch(err) { toast.error(err.response?.data?.message || 'Lỗi') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="form-label">Số bàn <span className="text-red-500">*</span></label>
        <input className="form-input" value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="VD: 01, A1" />
      </div>
      <div>
        <label className="form-label">Sức chứa (người) <span className="text-red-500">*</span></label>
        <input type="number" min="1" max="20" className="form-input" value={capacity} onChange={e => setCapacity(e.target.value)} />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-outline">Hủy</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Đang lưu...' : (initial ? 'Cập nhật' : 'Thêm')}</button>
      </div>
    </form>
  )
}

export default function AdminTables() {
  const [tables,       setTables]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [modal,        setModal]        = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = () => {
    setLoading(true)
    tableService.getAll().then(r => setTables(r.data.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    try { await tableService.delete(id); toast.success('Đã xóa bàn'); load() }
    catch(err) { toast.error(err.response?.data?.message || 'Không thể xóa') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý bàn ăn</h1>
        <button onClick={() => setModal('create')} className="btn-primary"><Plus className="h-4 w-4" /> Thêm bàn</button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map(t => (
            <div key={t.id} className={`card-sm relative hover:shadow-md transition-shadow border-2
              ${t.status === 'AVAILABLE' ? 'border-green-200' : t.status === 'OCCUPIED' ? 'border-red-200' : 'border-yellow-200'}`}>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">BÀN {t.tableNumber}</p>
                <div className="flex items-center justify-center gap-1 text-sm text-gray-500 my-2">
                  <Users className="h-4 w-4" />
                  <span>{t.capacity} người</span>
                </div>
                <TableStatusBadge status={t.status} />
              </div>
              <div className="flex justify-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <button onClick={() => setModal(t)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => setDeleteTarget(t)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {/* Add button card */}
          <button onClick={() => setModal('create')}
            className="card-sm flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-gray-400 hover:text-primary-500">
            <Plus className="h-8 w-8" />
            <span className="text-sm">Thêm bàn</span>
          </button>
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Thêm bàn' : 'Sửa bàn'} size="sm">
        {modal && <TableForm initial={modal === 'create' ? null : modal}
          onSave={() => { setModal(null); load() }} onCancel={() => setModal(null)} />}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Xóa bàn" danger message={`Xóa bàn "${deleteTarget?.tableNumber}"?`} confirmText="Xóa" />
    </div>
  )
}
