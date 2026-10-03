import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { User, Mail, Phone, Shield, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import userService from '../../services/userService'
import { formatRole, formatDateTime } from '../../utils/formatters'

export default function CustomerProfile() {
  const { user, refreshUser } = useAuth()
  const [editing,  setEditing]  = useState(false)
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { name: user?.name, email: user?.email, phone: user?.phone || '' }
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const payload = { name: data.name, email: data.email, phone: data.phone, password: data.password || undefined }
      const res = await userService.update(user.id, payload)
      // Update user trong context (không cần gọi lại /auth/me nữa)
      await refreshUser({
        ...user,
        name:  res.data.data.name  ?? data.name,
        email: res.data.data.email ?? data.email,
        phone: res.data.data.phone ?? data.phone,
      })
      toast.success('Cập nhật thông tin thành công')
      setEditing(false)
    } catch(err) { toast.error(err.response?.data?.message || 'Cập nhật thất bại') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>

      {/* Avatar + name */}
      <div className="card text-center">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="h-10 w-10 text-primary-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
        <div className="flex justify-center mt-2">
          <span className="badge badge-green">{formatRole(user?.role)}</span>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Tham gia từ: {formatDateTime(user?.createdAt)}
        </p>
      </div>

      {/* Info + Edit form */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Thông tin tài khoản</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-outline btn-sm">Chỉnh sửa</button>
          )}
        </div>

        {!editing ? (
          <div className="space-y-3">
            {[
              { icon: User,   label: 'Họ tên',    val: user?.name },
              { icon: Mail,   label: 'Email',     val: user?.email },
              { icon: Phone,  label: 'Điện thoại', val: user?.phone || 'Chưa cập nhật' },
              { icon: Shield, label: 'Vai trò',   val: formatRole(user?.role) },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-medium text-gray-900">{val}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="form-label">Họ tên</label>
              <input className={`form-input ${errors.name ? 'border-red-400' : ''}`}
                {...register('name', { required: 'Họ tên không được để trống', minLength: { value: 2, message: 'Tối thiểu 2 ký tự' } })} />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" className={`form-input ${errors.email ? 'border-red-400' : ''}`}
                {...register('email', { required: 'Email không được để trống' })} />
            </div>
            <div>
              <label className="form-label">Số điện thoại</label>
              <input className="form-input" {...register('phone')} />
            </div>
            <div>
              <label className="form-label">Mật khẩu mới <span className="text-gray-400 font-normal text-xs">(để trống nếu không đổi)</span></label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} className="form-input pr-10"
                  {...register('password', { minLength: { value: 6, message: 'Tối thiểu 6 ký tự' } })} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setEditing(false); reset() }} className="btn-outline flex-1">Hủy</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
