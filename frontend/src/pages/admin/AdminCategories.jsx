import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import categoryService from '../../services/categoryService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import { formatDateTime } from '../../utils/formatters'

function CategoryForm({ initial, onSave, onCancel }) {
  const [name, setName]   = useState(initial?.name || '')
  const [desc, setDesc]   = useState(initial?.description || '')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Tên danh mục không được để trống')
    setLoading(true)
    try {
      if (initial) {
        await categoryService.update(initial.id, { name, description: desc })
        toast.success('Cập nhật thành công')
      } else {
        await categoryService.create({ name, description: desc })
        toast.success('Thêm danh mục thành công')
      }
      onSave()
    } catch(err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="form-label">Tên danh mục <span className="text-red-500">*</span></label>
        <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="VD: Món chính" />
      </div>
      <div>
        <label className="form-label">Mô tả</label>
        <textarea className="form-input" rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Mô tả danh mục..." />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-outline">Hủy</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Đang lưu...' : (initial ? 'Cập nhật' : 'Thêm')}
        </button>
      </div>
    </form>
  )
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(null) // null | 'create' | category obj
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = async () => {
    setLoading(true)
    categoryService.getAll().then(r => setCategories(r.data.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    try { await categoryService.delete(id); toast.success('Đã xóa danh mục'); load() }
    catch(err) { toast.error(err.response?.data?.message || 'Không thể xóa') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Danh mục món ăn</h1>
        <button onClick={() => setModal('create')} className="btn-primary">
          <Plus className="h-4 w-4" /> Thêm danh mục
        </button>
      </div>

      {loading ? <LoadingSpinner /> : categories.length === 0
        ? <EmptyState title="Chưa có danh mục" action={<button onClick={() => setModal('create')} className="btn-primary">Thêm danh mục</button>} />
        : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>#</th><th>Tên danh mục</th><th>Mô tả</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td className="text-gray-400 text-xs">{c.id}</td>
                    <td className="font-medium">{c.name}</td>
                    <td className="text-gray-500 text-sm max-w-xs truncate">{c.description || '—'}</td>
                    <td className="text-xs text-gray-500">{formatDateTime(c.createdAt)}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => setModal(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      <Modal isOpen={!!modal} onClose={() => setModal(null)}
        title={modal === 'create' ? 'Thêm danh mục' : 'Sửa danh mục'} size="sm">
        {modal && (
          <CategoryForm
            initial={modal === 'create' ? null : modal}
            onSave={() => { setModal(null); load() }}
            onCancel={() => setModal(null)} />
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Xóa danh mục" danger
        message={`Xóa danh mục "${deleteTarget?.name}"? Danh mục không thể xóa nếu còn món ăn.`}
        confirmText="Xóa" />
    </div>
  )
}
