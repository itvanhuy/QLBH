import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Plus, Minus, Trash2, ShoppingCart, Search } from 'lucide-react'
import tableService from '../../services/tableService'
import productService from '../../services/productService'
import categoryService from '../../services/categoryService'
import orderService from '../../services/orderService'
import voucherService from '../../services/voucherService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatCurrency } from '../../utils/formatters'

export default function StaffOrderCreate() {
  const navigate = useNavigate()
  const [tables,     setTables]     = useState([])
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [selectedTable, setSelectedTable] = useState('')
  const [note,          setNote]          = useState('')
  const [cart,          setCart]          = useState([]) // [{product, quantity}]
  const [keyword,       setKeyword]       = useState('')
  const [catFilter,     setCatFilter]     = useState('')
  const [voucherCode,   setVoucherCode]   = useState('')
  const [voucherInfo,   setVoucherInfo]   = useState(null)
  const [voucherLoading, setVoucherLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      tableService.getAll(),
      productService.getAll({ status: 'AVAILABLE', size: 100 }),
      categoryService.getAll(),
    ]).then(([t, p, c]) => {
      setTables(t.data.data.filter(tb => tb.status === 'AVAILABLE'))
      setProducts(p.data.data.content)
      setCategories(c.data.data)
    }).finally(() => setLoading(false))
  }, [])

  // Lọc sản phẩm hiển thị
  const filtered = products.filter(p => {
    const matchKw  = !keyword  || p.name.toLowerCase().includes(keyword.toLowerCase())
    const matchCat = !catFilter || p.categoryId == catFilter
    return matchKw && matchCat
  })

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQty = (productId, delta) => {
    setCart(prev => prev
      .map(i => i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i)
      .filter(i => i.quantity > 0)
    )
  }

  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const discountAmount = voucherInfo ? voucherInfo.discountAmount : 0
  const total = Math.max(0, subtotal - discountAmount)

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return toast.error('Vui lòng nhập mã giảm giá')
    if (cart.length === 0) return toast.error('Vui lòng chọn món trước khi áp dụng mã')

    setVoucherLoading(true)
    try {
      const res = await voucherService.validate({ code: voucherCode.trim(), orderAmount: subtotal })
      setVoucherInfo(res.data.data)
      toast.success(`Áp dụng mã thành công: ${res.data.data.name}`)
    } catch (err) {
      setVoucherInfo(null)
      toast.error(err.response?.data?.message || 'Mã giảm giá không hợp lệ')
    } finally {
      setVoucherLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedTable) return toast.error('Vui lòng chọn bàn')
    if (cart.length === 0) return toast.error('Vui lòng chọn ít nhất 1 món')
    setSubmitting(true)
    try {
      await orderService.create({
        tableId: Number(selectedTable),
        note,
        voucherCode: voucherInfo?.code || null,
        items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      })
      toast.success('Tạo đơn hàng thành công!')
      navigate('/staff/orders')
    } catch(err) {
      toast.error(err.response?.data?.message || 'Không thể tạo đơn')
    } finally { setSubmitting(false) }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tạo đơn hàng mới</h1>
        <button onClick={() => navigate(-1)} className="btn-outline">← Quay lại</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Chọn món */}
        <div className="xl:col-span-2 space-y-4">
          {/* Table select */}
          <div className="card-sm">
            <label className="form-label">Chọn bàn <span className="text-red-500">*</span></label>
            <select value={selectedTable} onChange={e => setSelectedTable(e.target.value)} className="form-input">
              <option value="">-- Chọn bàn trống --</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>Bàn {t.tableNumber} ({t.capacity} người)</option>
              ))}
            </select>
            {tables.length === 0 && <p className="text-xs text-red-500 mt-1">Hiện không có bàn trống</p>}
          </div>

          {/* Product search + filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input placeholder="Tìm món..." value={keyword}
                onChange={e => setKeyword(e.target.value)} className="form-input pl-9" />
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="form-input w-44">
              <option value="">Tất cả</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(p => {
              const inCart = cart.find(i => i.product.id === p.id)
              return (
                <div key={p.id}
                  onClick={() => addToCart(p)}
                  className={`card-sm cursor-pointer hover:shadow-md transition-all border-2 select-none
                    ${inCart ? 'border-primary-300 bg-primary-50' : 'border-gray-100 hover:border-primary-200'}`}>
                  <img src={p.imageUrl} alt={p.name}
                    className="w-full h-28 object-cover rounded-lg mb-2 bg-gray-100"
                    onError={e => { e.target.src = 'https://placehold.co/200x120/f0f0f0/999?text=img' }} />
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{p.name}</p>
                  <p className="text-primary-500 font-bold text-sm mt-1">{formatCurrency(p.price)}</p>
                  {inCart && (
                    <div className="mt-2 bg-primary-100 text-primary-700 rounded-lg text-center text-xs font-semibold py-1">
                      ×{inCart.quantity} trong giỏ
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Giỏ hàng */}
        <div className="xl:col-span-1">
          <div className="card sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="h-5 w-5 text-primary-500" />
              <h2 className="font-semibold text-gray-900">Đơn hàng</h2>
              {cart.length > 0 && <span className="badge badge-orange">{cart.length} món</span>}
            </div>

            {cart.length === 0
              ? <p className="text-sm text-gray-400 text-center py-8">Chưa có món nào</p>
              : (
                <div className="space-y-3">
                  {cart.map(({ product: p, quantity: q }) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-primary-500">{formatCurrency(p.price)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateQty(p.id, -1)}
                          className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{q}</span>
                        <button onClick={() => updateQty(p.id, 1)}
                          className="w-6 h-6 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center">
                          <Plus className="h-3 w-3 text-primary-600" />
                        </button>
                        <button onClick={() => setCart(c => c.filter(i => i.product.id !== p.id))}
                          className="w-6 h-6 rounded-full hover:bg-red-100 flex items-center justify-center text-red-400">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }

            <div className="border-t border-gray-100 mt-4 pt-4 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Giảm giá</span>
                  <span className="text-red-500">-{formatCurrency(discountAmount)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input value={voucherCode} onChange={e => setVoucherCode(e.target.value)} placeholder="Nhập mã giảm giá" className="form-input flex-1" />
                <button type="button" onClick={handleApplyVoucher} disabled={voucherLoading || cart.length === 0} className="btn-outline whitespace-nowrap">
                  {voucherLoading ? '...' : 'Áp dụng'}
                </button>
              </div>

              {voucherInfo && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-2 text-xs text-green-700">
                  Mã {voucherInfo.code}: giảm {voucherInfo.type === 'PERCENT' ? `${voucherInfo.discountAmount} VNĐ` : formatCurrency(voucherInfo.discountAmount)}
                </div>
              )}

              <div className="flex justify-between font-bold text-gray-900">
                <span>Tổng cộng</span>
                <span className="text-primary-500 text-lg">{formatCurrency(total)}</span>
              </div>
              <div>
                <label className="form-label">Ghi chú</label>
                <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Ghi chú đặc biệt..." className="form-input text-sm" />
              </div>
              <button onClick={handleSubmit} disabled={submitting || cart.length === 0 || !selectedTable}
                className="btn-primary w-full btn-lg">
                {submitting ? 'Đang tạo...' : 'Xác nhận tạo đơn'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
