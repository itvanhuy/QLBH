import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Plus, Minus, Trash2, ShoppingCart, Search, Tag, X } from 'lucide-react'
import tableService    from '../../services/tableService'
import productService  from '../../services/productService'
import categoryService from '../../services/categoryService'
import orderService    from '../../services/orderService'
import voucherService  from '../../services/voucherService'
import LoadingSpinner  from '../../components/common/LoadingSpinner'
import ConfirmDialog   from '../../components/common/ConfirmDialog'
import { formatCurrency } from '../../utils/formatters'

export default function CustomerOrderCreate() {
  const navigate = useNavigate()
  const [tables,      setTables]      = useState([])
  const [products,    setProducts]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [submitting,  setSubmitting]  = useState(false)
  const [selectedTable, setSelectedTable] = useState('')
  const [note,          setNote]          = useState('')
  const [cart,          setCart]          = useState([])
  const [keyword,       setKeyword]       = useState('')
  const [catFilter,     setCatFilter]     = useState('')
  const [voucherCode,   setVoucherCode]   = useState('')
  const [voucher,       setVoucher]       = useState(null)
  const [voucherLoading, setVoucherLoading] = useState(false)
  const [confirmOpen,   setConfirmOpen]   = useState(false)

  useEffect(() => {
    Promise.all([
      tableService.getAll(),
      productService.getAll({ status: 'AVAILABLE', size: 100 }),
      categoryService.getAll(),
    ]).then(([t, p, c]) => {
      setTables(t.data.data.filter(tb => tb.status === 'AVAILABLE'))
      setProducts(p.data.data.content)
      setCategories(c.data.data)
    }).catch(() => toast.error('Không tải được dữ liệu'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(p => {
    const matchKw  = !keyword   || p.name.toLowerCase().includes(keyword.toLowerCase())
    const matchCat = !catFilter || String(p.categoryId) === String(catFilter)
    return matchKw && matchCat
  })

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id)
      if (ex) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0))
  }

  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  const discountAmount = (() => {
    if (!voucher) return 0
    if (voucher.type === 'PERCENT') {
      const d = subtotal * voucher.value / 100
      return voucher.maxDiscountAmount ? Math.min(d, voucher.maxDiscountAmount) : d
    }
    return Math.min(voucher.value, subtotal)
  })()

  const total = Math.max(0, subtotal - discountAmount)

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return toast.error('Nhập mã giảm giá')
    if (cart.length === 0)   return toast.error('Chọn món trước khi áp mã')
    setVoucherLoading(true)
    try {
      const res = await voucherService.validate({ code: voucherCode.trim(), orderAmount: subtotal })
      setVoucher(res.data.data)
      toast.success(`Áp dụng mã "${voucherCode}" thành công!`)
    } catch (err) {
      setVoucher(null)
      toast.error(err.response?.data?.message || 'Mã giảm giá không hợp lệ')
    } finally { setVoucherLoading(false) }
  }

  const confirmSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        tableId:     Number(selectedTable),
        note:        note || null,
        voucherCode: voucher?.code || null,
        items:       cart.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      }
      const res = await orderService.create(payload)
      toast.success('🎉 Đặt món thành công! Đơn đang được xử lý.')
      navigate(`/customer/orders/${res.data.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đặt món')
    } finally { setSubmitting(false) }
  }

  const handleSubmit = () => {
    if (!selectedTable)    return toast.error('Vui lòng chọn bàn')
    if (cart.length === 0) return toast.error('Vui lòng chọn ít nhất 1 món')
    setConfirmOpen(true)
  }

  const selectedTableObj = tables.find(t => String(t.id) === String(selectedTable))

  if (loading) return <LoadingSpinner />

  return (
    <>
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmSubmit}
        title="Xác nhận đặt món"
        message={
          <>Bạn xác nhận đang ngồi tại <strong>BÀN SỐ {selectedTableObj?.tableNumber ?? '?'}</strong> nhé?<br /><span className="text-xs text-gray-400">Chọn sai bàn sẽ bị nhầm đơn hàng với khách khác.</span></>
        }
        confirmText="Xác nhận đặt món"
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Đặt món</h1>
          <button onClick={() => navigate(-1)} className="btn-outline">← Quay lại</button>
        </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Left: Chọn bàn + Thực đơn ── */}
        <div className="xl:col-span-2 space-y-4">
          {/* Chọn bàn */}
          <div className="card-sm">
            <label className="form-label">Chọn bàn <span className="text-red-500">*</span></label>
            <select value={selectedTable} onChange={e => setSelectedTable(e.target.value)} className="form-input">
              <option value="">-- Chọn bàn trống --</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>Bàn {t.tableNumber} · {t.capacity} người</option>
              ))}
            </select>
            {tables.length === 0 && <p className="text-xs text-amber-600 mt-1">⚠ Hiện không có bàn trống, vui lòng <button onClick={() => navigate('/customer/reservations')} className="underline">đặt bàn trước</button></p>}
          </div>

          {/* Search + filter */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input placeholder="Tìm món ăn..." value={keyword} onChange={e => setKeyword(e.target.value)} className="form-input pl-9" />
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="form-input w-44">
              <option value="">Tất cả danh mục</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Danh mục pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button key={c.id} onClick={() => setCatFilter(catFilter == c.id ? '' : c.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${String(catFilter) === String(c.id) ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {c.name}
              </button>
            ))}
          </div>

          {/* Product grid */}
          {filtered.length === 0
            ? <p className="text-center text-gray-400 py-12">Không tìm thấy món ăn</p>
            : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filtered.map(p => {
                  const inCart = cart.find(i => i.product.id === p.id)
                  return (
                    <div key={p.id} onClick={() => addToCart(p)}
                      className={`card-sm cursor-pointer hover:shadow-md transition-all border-2 select-none
                        ${inCart ? 'border-primary-400 bg-primary-50' : 'border-gray-100 hover:border-primary-200'}`}>
                      <img src={p.imageUrl} alt={p.name}
                        className="w-full h-28 object-cover rounded-lg mb-2 bg-gray-100"
                        onError={e => { e.target.src = 'https://placehold.co/200x120/f5f5f5/aaa?text=No+Image' }} />
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">{p.name}</p>
                      <p className="text-primary-500 font-bold text-sm mt-1">{formatCurrency(p.price)}</p>
                      {inCart && (
                        <div className="mt-1.5 bg-primary-100 text-primary-700 rounded-lg text-center text-xs font-bold py-1">
                          ✓ ×{inCart.quantity}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>

        {/* ── Right: Giỏ hàng ── */}
        <div className="xl:col-span-1">
          <div className="card sticky top-20 space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary-500" />
              <h2 className="font-semibold text-gray-900">Giỏ hàng</h2>
              {cart.length > 0 && <span className="badge badge-orange">{cart.length} món</span>}
            </div>

            {cart.length === 0
              ? <p className="text-sm text-gray-400 text-center py-6">Nhấn vào món để thêm</p>
              : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto">
                  {cart.map(({ product: p, quantity: q }) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-primary-500">{formatCurrency(p.price)}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => updateQty(p.id, -1)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs">−</button>
                        <span className="w-5 text-center text-sm font-bold">{q}</span>
                        <button onClick={() => updateQty(p.id, 1)} className="w-6 h-6 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center text-xs text-primary-700">+</button>
                        <button onClick={() => setCart(c => c.filter(i => i.product.id !== p.id))} className="w-6 h-6 rounded-full hover:bg-red-100 flex items-center justify-center text-red-400 ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }

            {/* Voucher */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input value={voucherCode} onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã giảm giá" className="form-input pl-8 text-sm" />
                </div>
                <button onClick={handleApplyVoucher} disabled={voucherLoading} className="btn-outline btn-sm whitespace-nowrap">
                  {voucherLoading ? '...' : 'Áp dụng'}
                </button>
              </div>
              {voucher && (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs">
                  <span className="text-green-700 font-medium">✓ {voucher.name}</span>
                  <span className="text-green-700 font-bold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
            </div>

            {/* Tổng */}
            <div className="border-t pt-3 space-y-2">
              {voucher && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tạm tính</span><span>{formatCurrency(subtotal)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-red-500">
                  <span>Giảm giá</span><span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-lg">
                <span>Tổng cộng</span>
                <span className="text-primary-500">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Ghi chú */}
            <div>
              <label className="form-label text-xs">Ghi chú (tùy chọn)</label>
              <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                placeholder="Ít cay, không hành..." className="form-input text-sm" />
            </div>

            <button onClick={handleSubmit} disabled={submitting || cart.length === 0 || !selectedTable}
              className="btn-primary w-full">
              {submitting ? 'Đang đặt...' : `Đặt món · ${formatCurrency(total)}`}
            </button>

            {(!selectedTable || cart.length === 0) && (
              <p className="text-xs text-center text-gray-400">
                {!selectedTable ? '⚠ Chưa chọn bàn' : '⚠ Giỏ hàng trống'}
              </p>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
