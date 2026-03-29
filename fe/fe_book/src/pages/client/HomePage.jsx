import { useState, useEffect } from 'react';
import ProductTimeline from '../../components/ProductTimeline/ProductTimeline';
import { getSanPhamBanChay, getSanPhamMoiNhat } from '../../services/client/SanPhamCustomer';
import './HomePage.css';
import './HomePage.css';


const makeBooks = (prefix, count = 8) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i}`,
    image: `https://picsum.photos/seed/${prefix}${i}/300/400`,
    title: [
      'Đắc Nhân Tâm - Nghệ Thuật Đối Nhân Xử Thế',
      'Nhà Giả Kim - Paulo Coelho',
      'Tư Duy Nhanh Và Chậm',
      'Sapiens - Lược Sử Loài Người',
      'Atomic Habits - Thói Quen Nguyên Tử',
      'The Psychology Of Money',
      'Rèn Luyện Tư Duy Phản Biện',
      'Zero To One - Peter Thiel',
    ][i % 8],
    author: ['Dale Carnegie', 'Paulo Coelho', 'Daniel Kahneman', 'Yuval Noah Harari', 'James Clear', 'Morgan Housel', 'Richard Paul', 'Peter Thiel'][i % 8],
    price: [89000, 125000, 145000, 179000, 98000, 165000, 115000, 139000][i % 8],
    originalPrice: i % 3 === 0 ? [120000, 160000, 195000, 220000, 130000, 200000, 150000, 175000][i % 8] : null,
    rating: +(4.1 + (i * 0.1) % 0.9).toFixed(1),
    sold: [2340, 1820, 5610, 3200, 8900, 1450, 2760, 4100][i % 8],
    badge: i % 5 === 0 ? { type: 'hot', label: '🔥 Hot' } : i % 7 === 0 ? { type: 'new', label: 'New' } : null,
  }));


const featured = makeBooks('feat');

const HeroBanner = () => (
  <section className="hero-banner">
    <div className="hero-content">
      <h1 className="hero-heading">
        Khám Phá Thế Giới <br />
        <span className="hero-highlight">Tri Thức Vô Tận</span>
      </h1>
      <p className="hero-desc">
        Chất lượng - Thương Hiệu - Giá Cả - Uy tín
      </p>
      <div className="hero-cta">
        <button className="btn-primary-hero">Khám Phá Ngay</button>
        <button className="btn-secondary-hero">Xem Danh Mục</button>
      </div>
    </div>
    <div className="hero-visual">
      <div className="hero-circles">
        <div className="circle c1" />
        <div className="circle c2" />
        <div className="circle c3" />
      </div>
      <div className="floating-books">
        {['📗', '📘', '📕', '📙'].map((emoji, i) => (
          <div key={i} className={`floating-book fb${i + 1}`}>{emoji}</div>
        ))}
      </div>
    </div>
  </section >
);

const categories = [
  { label: 'Tất Cả', icon: '🌟' },
  { label: 'Kinh Doanh', icon: '💼' },
  { label: 'Tâm Lý', icon: '🧠' },
  { label: 'Văn Học', icon: '✍️' },
  { label: 'Khoa Học', icon: '🔬' },
  { label: 'Lịch Sử', icon: '🏛️' },
  { label: 'Thiếu Nhi', icon: '🧸' },
  { label: 'Ngoại Ngữ', icon: '🌏' },
];

const CategoryBar = () => (
  <section className="category-bar">
    {categories.map((cat, i) => (
      <button key={i} className={`cat-chip ${i === 0 ? 'active' : ''}`}>
        <span>{cat.icon}</span> {cat.label}
      </button>
    ))}
  </section>
);


const stats = [
  { value: '10,000+', label: 'Đầu Sách' },
  { value: '50,000+', label: 'Khách Hàng' },
  { value: '99%', label: 'Hài Lòng' },
  { value: '24/7', label: 'Hỗ Trợ' },
];

const StatsBanner = () => (
  <div className="stats-banner">
    {stats.map((s, i) => (
      <div key={i} className="stat-item">
        <span className="stat-value">{s.value}</span>
        <span className="stat-label">{s.label}</span>
      </div>
    ))}
  </div>
);


const HomePage = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [banChayData, moiNhatData] = await Promise.all([
          getSanPhamBanChay(),
          getSanPhamMoiNhat()
        ]);

        const mapProduct = (item, isHot, isNew) => ({
          id: item.id,
          image: item.hinhAnhs && item.hinhAnhs.length > 0 ? item.hinhAnhs[0] : 'https://picsum.photos/seed/default/300/400',
          title: item.tenSach,
          author: item.tenTacGias && item.tenTacGias.length > 0 ? item.tenTacGias.join(', ') : 'Chưa cập nhật',
          price: item.giaBan || 0,
          originalPrice: null,
          rating: 4.5,
          sold: item.soLuong || 0,
          badge: isHot ? { type: 'hot', label: '🔥 Hot' } : isNew ? { type: 'new', label: 'New' } : null,
        });

        if (Array.isArray(banChayData)) {
          setBestSellers(banChayData.map(item => mapProduct(item, true, false)));
        }

        if (Array.isArray(moiNhatData)) {
          setNewArrivals(moiNhatData.map(item => mapProduct(item, false, true)));
        }
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <main className="homepage">
      <HeroBanner />


      <div className="timelines-section">
        <CategoryBar />

        <ProductTimeline
          title="🔥 Sản Phẩm Nổi Bật"
          subtitle="Những cuốn sách được yêu thích nhất tháng này"
          products={bestSellers}
          accentColor="linear-gradient(135deg, #f093fb, #f5576c)"
        />

        <ProductTimeline
          title="✨ Mới Ra Mắt"
          subtitle="Cập nhật liên tục – sách hot nhất vừa về kho"
          products={newArrivals}
          accentColor="linear-gradient(135deg, #4facfe, #00f2fe)"
        />

        <ProductTimeline
          title="✨ Được xem nhiều nhất"
          subtitle="Độc giả tìm kiếm nhiều nhất – không thể bỏ qua"
          products={featured}
          accentColor="linear-gradient(135deg, #43e97b, #38f9d7)"
        />
      </div>
    </main>
  );
};

export default HomePage;
