import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter } from 'lucide-react'
import productService from '../../services/productService'
import categoryService from '../../services/categoryService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import { formatCurrency } from '../../utils/formatters'

export default function MenuPage() {
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [keyword,    setKeyword]    = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => { categoryService.getAll().then(r => setCategories(r.data.data)) }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = { page, size: 12, status: 'AVAILABLE' }
        if (keyword)    params.keyword    = keyword
        if (categoryId) params.categoryId = categoryId
        const r = await productService.getAll(params)
        setProducts(r.data.data.content)
        setTotalPages(r.data.data.totalPages)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [keyword, categoryId, page])

  const handleSearch = (e) => { setKeyword(e.target.value); setPage(0) }
  const handleCategory = (id) => { setCategoryId(id); setPage(0) }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Thực đơn</h1>
        <p className="text-gray-500 mt-2">Khám phá những món ăn ngon của chúng tôi</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Tìm kiếm món ăn..."
            value={keyword} onChange={handleSearch}
            className="form-input pl-9" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => handleCategory('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${!categoryId ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Tất cả
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => handleCategory(c.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${categoryId == c.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {loading ? <LoadingSpinner /> : products.length === 0
        ? <EmptyState title="Không tìm thấy món ăn" description="Thử tìm kiếm với từ khóa khác" />
        : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(p => (
                <Link key={p.id} to={`/menu/${p.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group border border-gray-100">
                  <div className="overflow-hidden bg-gray-100">
                    <img src={p.imageUrl} alt={p.name}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { e.target.src = 'https://placehold.co/300x200/f97316/ffffff?text=Mon+An' }} />
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-primary-500 font-medium">{p.categoryName}</span>
                    <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2">{p.name}</h3>
                    {p.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-primary-500 text-lg">{formatCurrency(p.price)}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Còn món</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )
      }
    </div>
  )
}
