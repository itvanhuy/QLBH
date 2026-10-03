import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import authService from '../../services/authService'
import { UtensilsCrossed, Eye, EyeOff, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const navigate  = useNavigate()
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authService.register({
        name:     data.name,
        email:    data.email,
        password: data.password,
        phone:    data.phone || undefined,
      })
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng ký thất bại'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-2xl mb-4">
              <UtensilsCrossed className="h-8 w-8 text-primary-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Tạo tài khoản</h1>
            <p className="text-sm text-gray-500 mt-1">Đăng ký để bắt đầu đặt món</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Họ tên */}
            <div>
              <label className="form-label">Họ và tên <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Nguyễn Văn A"
                className={`form-input ${errors.name ? 'border-red-400' : ''}`}
                {...register('name', {
                  required: 'Họ tên không được để trống',
                  minLength: { value: 2, message: 'Họ tên ít nhất 2 ký tự' },
                })}
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email <span className="text-red-500">*</span></label>
              <input type="email" placeholder="email@example.com"
                className={`form-input ${errors.email ? 'border-red-400' : ''}`}
                {...register('email', {
                  required: 'Email không được để trống',
                  pattern:  { value: /^\S+@\S+\.\S+$/, message: 'Email không đúng định dạng' },
                })}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="form-label">Số điện thoại</label>
              <input type="tel" placeholder="0901234567"
                className="form-input"
                {...register('phone', {
                  pattern: { value: /^(\+84|0)[0-9]{9,10}$/, message: 'Số điện thoại không hợp lệ' },
                })}
              />
              {errors.phone && <p className="form-error">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Mật khẩu <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  className={`form-input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  {...register('password', {
                    required: 'Mật khẩu không được để trống',
                    minLength: { value: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
                  })}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="form-label">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
              <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                className={`form-input ${errors.confirmPassword ? 'border-red-400' : ''}`}
                {...register('confirmPassword', {
                  required: 'Vui lòng xác nhận mật khẩu',
                  validate: v => v === password || 'Mật khẩu không khớp',
                })}
              />
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full btn-lg mt-2">
              {loading
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <UserPlus className="h-4 w-4" />
              }
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary-500 font-medium hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
