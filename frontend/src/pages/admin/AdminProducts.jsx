import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import productService from '../../services/productService'
import categoryService from '../../services/categoryService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import { ProductStatusBadge } from '../../components/common/StatusBadge'
import { formatCurrency } from '../../utils/formatters'

function ProductForm({ initial, categories, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || '', description: initial?.description || '',
    price: initial?.price || '', imageUrl: initial?.imageUrl || '',
    categoryId: initial?.categoryId || '', status: initial?.status || 'AVAILABLE',
  })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.categoryId) return toast.error('Vui lòng điền đầy đủ thông tin')
    setLoading(true)
    try {
      const data = { ...form, price: Number(form.price), categoryId: Number(form.categoryId) }
      if (initial) { await productService.update(initial.id, data); toast.success('Cập nhật thành công') }
      else         { await productService.create(data);             toast.success('Thêm món thành công') }
      onSave()
    } catch(err) { toast.error(err.response?.data?.message || 'Lỗi') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="form-label">Tên món <span className="text-red-500">*</span></label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Giá (VNĐ) <span className="text-red-500">*</span></label>
          <input type="number" className="form-input" value={form.price} onChange={e => set('price', e.target.value)} min="0" />
        </div>
        <div>
          <label className="form-label">Danh mục <span className="text-red-500">*</span></label>
          <select className="form-input" value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
            <option value="">-- Chọn danh mục --</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="form-label">URL hình ảnh</label>
          <input className="form-input" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://..." />
        </div>
        <div className="col-span-2">
          <label className="form-label">Mô tả</label>
          <textarea className="form-input" rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        {initial && (
          <div>
            <label className="form-label">Trạng thái</label>
            <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="AVAILABLE">Còn phục vụ</option>
              <option value="UNAVAILABLE">Tạm hết</option>
            </select>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-outline">Hủy</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Đang lưu...' : (initial ? 'Cập nhật' : 'Thêm')}</button>
      </div>
    </form>
  )
}

export default function AdminProducts() {
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [keyword,    setKeyword]    = useState('')
  const [catFilter,  setCatFilter]  = useState('')
  const [modal,      setModal]      = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { categoryService.getAll().then(r => setCategories(r.data.data)) }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, size: 20 }
      if (keyword)   params.keyword    = keyword
      if (catFilter) params.categoryId = catFilter
      const r = await productService.getAll(params)
      setProducts(r.data.data.content)
      setTotalPages(r.data.data.totalPages)
    } finally { setLoading(false) }
  }, [page, keyword, catFilter])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    try { await productService.delete(id); toast.success('Đã xóa'); load() }
    catch(err) { toast.error(err.response?.data?.message || 'Không thể xóa') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý món ăn</h1>
        <button onClick={() => setModal('create')} className="btn-primary"><Plus className="h-4 w-4" /> Thêm món</button>
      </div>

      <div className="card-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input placeholder="Tìm món ăn..." value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(0) }} className="form-input pl-9" />
        </div>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(0) }} className="form-input w-44">
          <option value="">Tất cả danh mục</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : products.length === 0
        ? <EmptyState title="Không có món ăn nào" />
        : (
          <>
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Hình</th><th>Tên món</th><th>Danh mục</th><th>Giá</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td><img src={p.imageUrl} alt={p.name} className="w-12 h-10 rounded-lg object-cover bg-gray-100"
                        onError={e => { e.target.src = 'https://placehold.co/100x80/f0f0f0/999?text=img' }} /></td>
                      <td className="font-medium max-w-xs"><p className="truncate">{p.name}</p></td>
                      <td><span className="badge badge-orange">{p.categoryName}</span></td>
                      <td className="font-semibold text-primary-500">{formatCurrency(p.price)}</td>
                      <td><ProductStatusBadge status={p.status} /></td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => setModal(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="h-4 w-4" /></button>
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

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Thêm món ăn' : 'Sửa món ăn'} size="lg">
        {modal && <ProductForm initial={modal === 'create' ? null : modal} categories={categories}
          onSave={() => { setModal(null); load() }} onCancel={() => setModal(null)} />}
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Xóa món ăn" danger message={`Xóa món "${deleteTarget?.name}"?`} confirmText="Xóa" />
    </div>
  )
}
