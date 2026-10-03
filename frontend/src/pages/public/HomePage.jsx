import { Link } from 'react-router-dom'
import { UtensilsCrossed, Star, Clock, MapPin, ArrowRight, ChefHat, Users, Award } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const features = [
  { icon: ChefHat,  title: 'Đầu bếp chuyên nghiệp', desc: 'Đội ngũ đầu bếp giàu kinh nghiệm, mang đến những món ăn ngon nhất' },
  { icon: Clock,    title: 'Phục vụ nhanh chóng',    desc: 'Đảm bảo thời gian phục vụ nhanh, không để khách chờ lâu' },
  { icon: Award,    title: 'Chất lượng đảm bảo',     desc: 'Nguyên liệu tươi ngon, an toàn vệ sinh thực phẩm đặt lên hàng đầu' },
  { icon: Users,    title: 'Không gian thoải mái',    desc: 'Không gian rộng rãi, phù hợp cho cả gia đình và nhóm bạn' },
]

const highlights = [
  { name: 'Bún bò Huế',       price: '70.000 ₫', img: 'https://placehold.co/300x200/f97316/ffffff?text=Bun+Bo', category: 'Món chính' },
  { name: 'Burger bò phô mai', price: '75.000 ₫', img: 'https://placehold.co/300x200/ea580c/ffffff?text=Burger',  category: 'Đồ ăn nhanh' },
  { name: 'Lẩu thái hải sản',  price: '250.000 ₫', img: 'https://placehold.co/300x200/c2410c/ffffff?text=Lau',    category: 'Món chính' },
  { name: 'Pizza margherita',  price: '120.000 ₫', img: 'https://placehold.co/300x200/9a3412/ffffff?text=Pizza',  category: 'Đồ ăn nhanh' },
]

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Star className="h-4 w-4 fill-white" />
              Nhà hàng được yêu thích nhất
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Trải nghiệm ẩm thực<br />
              <span className="text-yellow-300">đỉnh cao</span> của bạn
            </h1>
            <p className="text-white/80 text-lg mb-8 max-w-md">
              Thực đơn phong phú, không gian ấm cúng, dịch vụ tận tâm. Đặt bàn ngay hôm nay!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link to="/menu" className="btn bg-white text-primary-600 hover:bg-gray-50 btn-lg font-semibold">
                Xem thực đơn <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={isAuthenticated ? '/customer/reservations' : '/login'}
                className="btn border-2 border-white text-white hover:bg-white/10 btn-lg font-semibold"
              >
                Đặt bàn ngay
              </Link>
            </div>
          </div>
          <div className="flex-1 hidden md:flex justify-center">
            <div className="w-72 h-72 bg-white/10 rounded-full flex items-center justify-center">
              <UtensilsCrossed className="h-36 w-36 text-white/60" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: '500+', label: 'Khách hàng hài lòng' },
            { val: '50+',  label: 'Món ăn đặc sắc' },
            { val: '10',   label: 'Bàn ăn rộng rãi' },
            { val: '5★',   label: 'Đánh giá chất lượng' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-primary-500">{s.val}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Tại sao chọn chúng tôi?</h2>
          <p className="text-gray-500 mt-2">Chúng tôi cam kết mang lại trải nghiệm tốt nhất</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(f => (
            <div key={f.title} className="card text-center hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-xl mb-4">
                <f.icon className="h-6 w-6 text-primary-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Highlight Menu ────────────────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Món nổi bật</h2>
              <p className="text-gray-500 mt-1">Những món ăn được yêu thích nhất</p>
            </div>
            <Link to="/menu" className="btn-outline hidden sm:flex items-center gap-2">
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map(item => (
              <div key={item.name} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="overflow-hidden">
                  <img src={item.img} alt={item.name}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4">
                  <span className="text-xs text-primary-500 font-medium">{item.category}</span>
                  <h3 className="font-semibold text-gray-900 mt-1">{item.name}</h3>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-primary-500">{item.price}</span>
                    <Link to="/menu" className="btn-primary btn-sm">Đặt ngay</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="bg-primary-600 text-white py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng thưởng thức?</h2>
          <p className="text-white/80 mb-8">Đăng ký tài khoản để đặt bàn và theo dõi đơn hàng dễ dàng hơn</p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-50 btn-lg font-semibold">
              Đăng ký miễn phí
            </Link>
            <Link to="/menu" className="btn border-2 border-white text-white hover:bg-white/10 btn-lg">
              Xem thực đơn
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
