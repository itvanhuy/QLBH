import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { Search, Lock, Unlock, Trash2, Edit, UserCog } from 'lucide-react'
import userService from '../../services/userService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { formatDateTime, formatRole } from '../../utils/formatters'

const ROLES = ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_CUSTOMER']
const roleBadge = { ROLE_ADMIN: 'badge-red', ROLE_STAFF: 'badge-blue', ROLE_CUSTOMER: 'badge-green' }

export default function AdminUsers() {
  const [users,      setUsers]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [keyword,    setKeyword]    = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [roleModal,    setRoleModal]    = useState(null)
  const [newRole,      setNewRole]      = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, size: 20 }
      if (keyword)      params.keyword  = keyword
      if (roleFilter)   params.role     = roleFilter
      if (activeFilter !== '') params.isActive = activeFilter
      const r = await userService.getAll(params)
      setUsers(r.data.data.content)
      setTotalPages(r.data.data.totalPages)
    } finally { setLoading(false) }
  }, [page, keyword, roleFilter, activeFilter])

  useEffect(() => { load() }, [load])

  const handleLock   = async (id) => { try { await userService.lock(id);   toast.success('Đã khóa');     load() } catch {} }
  const handleUnlock = async (id) => { try { await userService.unlock(id); toast.success('Đã mở khóa'); load() } catch {} }
  const handleDelete = async (id) => { try { await userService.delete(id); toast.success('Đã xóa');      load() } catch {} }
  const handleChangeRole = async () => {
    try {
      await userService.changeRole(roleModal.id, newRole)
      toast.success('Đã thay đổi role')
      setRoleModal(null)
      load()
    } catch {}
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>

      {/* Filters */}
      <div className="card-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input placeholder="Tìm theo email, tên..." value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(0) }}
            className="form-input pl-9" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(0) }} className="form-input w-44">
          <option value="">Tất cả role</option>
          {ROLES.map(r => <option key={r} value={r}>{formatRole(r)}</option>)}
        </select>
        <select value={activeFilter} onChange={e => { setActiveFilter(e.target.value); setPage(0) }} className="form-input w-44">
          <option value="">Tất cả trạng thái</option>
          <option value="true">Hoạt động</option>
          <option value="false">Bị khóa</option>
        </select>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="table-container">
            <table className="table">
              <thead><tr>
                <th>#</th><th>Họ tên</th><th>Email</th><th>SĐT</th>
                <th>Role</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="text-gray-400 text-xs">{u.id}</td>
                    <td className="font-medium">{u.name}</td>
                    <td className="text-gray-600">{u.email}</td>
                    <td className="text-gray-500">{u.phone || '—'}</td>
                    <td><span className={`badge ${roleBadge[u.role]}`}>{formatRole(u.role)}</span></td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                        {u.isActive ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td className="text-xs text-gray-500">{formatDateTime(u.createdAt)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setRoleModal(u); setNewRole(u.role) }}
                          title="Đổi role" className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500">
                          <UserCog className="h-4 w-4" />
                        </button>
                        {u.isActive
                          ? <button onClick={() => handleLock(u.id)} title="Khóa"
                              className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-500">
                              <Lock className="h-4 w-4" />
                            </button>
                          : <button onClick={() => handleUnlock(u.id)} title="Mở khóa"
                              className="p-1.5 rounded-lg hover:bg-green-50 text-green-500">
                              <Unlock className="h-4 w-4" />
                            </button>
                        }
                        <button onClick={() => setDeleteTarget(u)} title="Xóa"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
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

      {/* Delete confirm */}
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Xóa người dùng" danger
        message={`Bạn có chắc muốn xóa tài khoản "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa" />

      {/* Change role modal */}
      <Modal isOpen={!!roleModal} onClose={() => setRoleModal(null)} title="Thay đổi Role" size="sm">
        <p className="text-sm text-gray-600 mb-4">Người dùng: <strong>{roleModal?.name}</strong></p>
        <select value={newRole} onChange={e => setNewRole(e.target.value)} className="form-input mb-4">
          {ROLES.map(r => <option key={r} value={r}>{formatRole(r)}</option>)}
        </select>
        <div className="flex justify-end gap-3">
          <button onClick={() => setRoleModal(null)} className="btn-outline">Hủy</button>
          <button onClick={handleChangeRole} className="btn-primary">Lưu</button>
        </div>
      </Modal>
    </div>
  )
}
