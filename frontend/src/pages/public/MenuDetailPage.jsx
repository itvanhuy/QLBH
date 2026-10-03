import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Tag } from 'lucide-react'
import productService from '../../services/productService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatCurrency } from '../../utils/formatters'
import { useAuth } from '../../hooks/useAuth'

export default function MenuDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, isCustomer, isStaff } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    productService.getById(id)
      .then(r => setProduct(r.data.data))
      .catch(() => setError('Không tìm thấy món ăn'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingSpinner />
  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500 mb-4">{error}</p>
      <Link to="/menu" className="btn-primary">Quay lại thực đơn</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/menu" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Quay lại thực đơn
      </Link>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 md:flex">
        {/* Image */}
        <div className="md:w-1/2">
          <img src={product.imageUrl} alt={product.name}
            className="w-full h-64 md:h-full object-cover"
            onError={e => { e.target.src = 'https://placehold.co/600x400/f97316/ffffff?text=Mon+An' }} />
        </div>

        {/* Info */}
        <div className="md:w-1/2 p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-4 w-4 text-primary-400" />
            <span className="text-sm text-primary-500 font-medium">{product.categoryName}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>
          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>
          )}

          <div className="mt-auto">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-primary-500">{formatCurrency(product.price)}</span>
              <span className="text-sm text-gray-400">/ phần</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {product.status === 'AVAILABLE' ? 'Món đang được phục vụ' : 'Món tạm thời ngừng phục vụ'}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) return navigate('/login')
                  if (isCustomer) return navigate('/customer/order')
                  if (isStaff)    return navigate('/staff/orders/new')
                  navigate('/admin/orders')
                }}
                className="btn-primary w-full btn-lg justify-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Đặt ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
