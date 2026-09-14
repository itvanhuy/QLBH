import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import dashboardService from '../../services/dashboardService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatCurrency } from '../../utils/formatters'

const COLORS = ['#f97316','#ea580c','#fb923c','#fed7aa','#fdba74']

export default function AdminReports() {
  const [monthly,  setMonthly]  = useState([])
  const [topProds, setTopProds] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [year,     setYear]     = useState(new Date().getFullYear())

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [m, t] = await Promise.all([
        dashboardService.getRevenueMonthly(year),
        dashboardService.getTopProducts(10),
      ])
      setMonthly(m.data.data)
      setTopProds(t.data.data)
      setLoading(false)
    }
    load()
  }, [year])

  if (loading) return <LoadingSpinner />

  const totalRevenue = monthly.reduce((sum, m) => sum + (m.revenue || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
          <p className="text-gray-500 text-sm mt-1">Tổng doanh thu năm {year}: <strong className="text-primary-500">{formatCurrency(totalRevenue)}</strong></p>
        </div>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="form-input w-28">
          {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Monthly revenue bar chart */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Doanh thu theo tháng — {year}</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthly} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v/1000000).toFixed(1)+'M'} />
            <Tooltip formatter={v => formatCurrency(v)} labelFormatter={l => l} />
            <Bar dataKey="revenue" name="Doanh thu" fill="#f97316" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top products table */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Top 10 món bán chạy</h2>
          {topProds.length === 0
            ? <p className="text-gray-400 text-sm text-center py-8">Chưa có dữ liệu</p>
            : (
              <div className="space-y-3">
                {topProds.map((p, i) => (
                  <div key={p.productId} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${i < 3 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.productName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-primary-500 h-1.5 rounded-full"
                            style={{ width: `${(p.totalQuantity / topProds[0]?.totalQuantity) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{p.totalQuantity} phần</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-primary-500 whitespace-nowrap">{formatCurrency(p.totalRevenue)}</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Pie chart */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Phân bố doanh thu theo tháng</h2>
          {monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={monthly.filter(m => m.revenue > 0)} dataKey="revenue" nameKey="label"
                  cx="50%" cy="50%" outerRadius={100} label={({ label, percent }) => `${label} ${(percent*100).toFixed(0)}%`}>
                  {monthly.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-20">Chưa có dữ liệu</p>}
        </div>
      </div>
    </div>
  )
}
