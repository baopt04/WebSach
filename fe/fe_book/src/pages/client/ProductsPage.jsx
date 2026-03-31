import { useState } from 'react';
import {
  Slider,
  Checkbox,
  Rate,
  Pagination,
  Select,
  Tag,
  Button,
  Input,
  Empty,
} from 'antd';
import {
  FilterOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  SearchOutlined,
  StarFilled,
  CloseOutlined,
} from '@ant-design/icons';
import './ProductsPage.css';

const { Option } = Select;

const categories = [
  { key: 'all', label: 'Tất cả', count: 240 },
  { key: 'business', label: 'Kinh doanh & Quản lý', count: 48 },
  { key: 'psychology', label: 'Tâm lý học', count: 35 },
  { key: 'literature', label: 'Văn học trong nước', count: 62 },
  { key: 'foreign-lit', label: 'Văn học nước ngoài', count: 44 },
  { key: 'science', label: 'Khoa học - Công nghệ', count: 29 },
  { key: 'history', label: 'Lịch sử & Địa lý', count: 22 },
  { key: 'children', label: 'Sách thiếu nhi', count: 57 },
  { key: 'language', label: 'Ngoại ngữ', count: 31 },
  { key: 'self-help', label: 'Kỹ năng sống', count: 40 },
];

const publishers = ['NXB Trẻ', 'NXB Kim Đồng', 'Alpha Books', 'First News', 'NXB Tổng Hợp'];

const bookTitles = [
  'Đắc Nhân Tâm', 'Nhà Giả Kim', 'Tư Duy Nhanh Và Chậm', 'Sapiens',
  'Atomic Habits', 'The Psychology Of Money', 'Tuổi Trẻ Đáng Giá Bao Nhiêu',
  'Cà Phê Cùng Tony', 'Dám Nghĩ Lớn', 'Thiện Ác Đại Ma', 'Tôi Thấy Hoa Vàng',
  'Đất Rừng Phương Nam', 'Cho Tôi Xin Một Vé Đi Tuổi Thơ', 'Sống Đẹp',
  'Người Giàu Có Nhất Thành Babylon', 'Zero To One', 'Bí Mật Tư Duy Triệu Phú',
  'Không Bao Giờ Là Thất Bại', 'Outliers', 'Thinking Fast And Slow',
];

const authors = [
  'Dale Carnegie', 'Paulo Coelho', 'Daniel Kahneman', 'Yuval Noah Harari',
  'James Clear', 'Morgan Housel', 'Rosie Nguyễn', 'Tony Buổi Sáng',
  'David Schwartz', 'Katherine Pancol', 'Nguyễn Nhật Ánh', 'Đoàn Giỏi',
];

const allProducts = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  image: `https://picsum.photos/seed/book${i + 10}/260/340`,
  title: bookTitles[i % bookTitles.length],
  author: authors[i % authors.length],
  publisher: publishers[i % publishers.length],
  price: [89000, 125000, 145000, 179000, 98000, 165000, 115000, 139000, 75000, 199000][i % 10],
  originalPrice: i % 3 !== 0 ? null : [120000, 160000, 195000, 220000, 130000, 200000, 150000, 175000, 100000, 240000][i % 10],
  rating: +(3.8 + (i % 12) * 0.1).toFixed(1),
  sold: [2340, 1820, 5610, 3200, 890, 1450, 2760, 410, 3900, 760][i % 10],
  category: categories[1 + (i % (categories.length - 1))].key,
  isNew: i % 7 === 0,
  isBestseller: i % 5 === 0,
}));

const PAGE_SIZE = 16;

const BookCard = ({ product }) => {
  const { image, title, author, price, originalPrice, rating, sold, isNew, isBestseller } = product;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="book-card">
      {/* Badges */}
      <div className="book-badges">
        {isBestseller && <span className="badge badge-best">Bán chạy</span>}
        {isNew && <span className="badge badge-new">Mới</span>}
        {discount > 0 && <span className="badge badge-sale">-{discount}%</span>}
      </div>

      {/* Image */}
      <div className="book-image-wrap">
        <img src={image} alt={title} className="book-image" loading="lazy" />
        <div className="book-hover-overlay">
          <button className="overlay-btn">
            <EyeOutlined /> Xem nhanh
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="book-info">
        <p className="book-author">{author}</p>
        <h3 className="book-title">{title}</h3>


        <div className="book-price-row">
          <span className="book-price">{price.toLocaleString('vi-VN')}₫</span>
          {originalPrice && (
            <span className="book-original">{originalPrice.toLocaleString('vi-VN')}₫</span>
          )}
        </div>

        <div className="book-actions">
          <button className="btn-buy-now">
            <ShoppingCartOutlined /> Mua ngay
          </button>
          <button className="btn-detail">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── SIDEBAR ───────────────────────────────────────────── */
const Sidebar = ({ activeCat, onCatChange, priceRange, onPriceChange, selectedPublishers, onPublisherChange, minRating, onRatingChange, onReset }) => (
  <aside className="products-sidebar">
    {/* Categories */}
    <div className="sidebar-section">
      <h4 className="sidebar-title">Danh mục sách</h4>
      <ul className="cat-list">
        {categories.map((cat) => (
          <li
            key={cat.key}
            className={`cat-item ${activeCat === cat.key ? 'active' : ''}`}
            onClick={() => onCatChange(cat.key)}
          >
            <span className="cat-label">{cat.label}</span>
            <span className="cat-count">{cat.count}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="sidebar-divider" />

    {/* Price range */}
    <div className="sidebar-section">
      <h4 className="sidebar-title">Khoảng giá</h4>
      <Slider
        range
        min={0}
        max={500000}
        step={10000}
        value={priceRange}
        onChange={onPriceChange}
        tooltip={{ formatter: (v) => `${(v / 1000).toFixed(0)}k₫` }}
      />
      <div className="price-range-labels">
        <span>{(priceRange[0] / 1000).toFixed(0)}k₫</span>
        <span>{(priceRange[1] / 1000).toFixed(0)}k₫</span>
      </div>
    </div>

    <div className="sidebar-divider" />

    {/* Publishers */}
    <div className="sidebar-section">
      <h4 className="sidebar-title">Nhà xuất bản</h4>
      <div className="checkbox-list">
        {publishers.map((pub) => (
          <Checkbox
            key={pub}
            checked={selectedPublishers.includes(pub)}
            onChange={(e) => {
              if (e.target.checked) onPublisherChange([...selectedPublishers, pub]);
              else onPublisherChange(selectedPublishers.filter((p) => p !== pub));
            }}
          >
            {pub}
          </Checkbox>
        ))}
      </div>
    </div>

    <div className="sidebar-divider" />


    <div className="sidebar-divider" />

    <button className="btn-reset-filter" onClick={onReset}>
      <CloseOutlined /> Xóa bộ lọc
    </button>
  </aside>
);

/* ─── MAIN PAGE ─────────────────────────────────────────── */
const ProductsPage = () => {
  const [activeCat, setActiveCat] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [selectedPublishers, setSelectedPublishers] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter
  const filtered = allProducts.filter((p) => {
    if (activeCat !== 'all' && p.category !== activeCat) return false;
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
    if (selectedPublishers.length > 0 && !selectedPublishers.includes(p.publisher)) return false;
    if (minRating > 0 && p.rating < minRating) return false;
    if (searchText && !p.title.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'newest') return b.id - a.id;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.sold - a.sold; // popular
  });

  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleReset = () => {
    setActiveCat('all');
    setPriceRange([0, 500000]);
    setSelectedPublishers([]);
    setMinRating(0);
    setSearchText('');
    setCurrentPage(1);
  };

  const activeCatLabel = categories.find((c) => c.key === activeCat)?.label;

  return (
    <div className="products-page">
      {/* ── Breadcrumb & search bar ── */}
      <div className="products-topbar">
        <div className="breadcrumb">
          <span>Trang chủ</span>
          <span className="bc-sep">›</span>
          <span className="bc-current">Sản phẩm</span>
        </div>
        <div className="top-search">
          <Input
            placeholder="Tìm kiếm sách..."
            prefix={<SearchOutlined style={{ color: '#bbb' }} />}
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
            allowClear
            className="search-input"
          />
        </div>
      </div>

      <div className="products-layout">
        {/* ── Sidebar ── */}
        <Sidebar
          activeCat={activeCat}
          onCatChange={(k) => { setActiveCat(k); setCurrentPage(1); }}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          selectedPublishers={selectedPublishers}
          onPublisherChange={setSelectedPublishers}
          minRating={minRating}
          onRatingChange={setMinRating}
          onReset={handleReset}
        />

        {/* ── Main content ── */}
        <main className="products-main">
          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="toolbar-left">
              <span className="result-count">
                <strong>{filtered.length}</strong> sản phẩm
                {activeCat !== 'all' && (
                  <Tag color="blue" closable onClose={() => setActiveCat('all')} style={{ marginLeft: 8 }}>
                    {activeCatLabel}
                  </Tag>
                )}
              </span>
            </div>
            <div className="toolbar-right">
              <span className="sort-label">Sắp xếp:</span>
              <Select value={sortBy} onChange={setSortBy} className="sort-select" size="middle">
                <Option value="popular">Phổ biến nhất</Option>
                <Option value="newest">Mới nhất</Option>
                <Option value="rating">Đánh giá cao</Option>
                <Option value="price-asc">Giá tăng dần</Option>
                <Option value="price-desc">Giá giảm dần</Option>
              </Select>
            </div>
          </div>

          {/* Grid */}
          {paginated.length > 0 ? (
            <div className="books-grid">
              {paginated.map((p) => (
                <BookCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty-wrap">
              <Empty description="Không tìm thấy sản phẩm phù hợp" />
              <button className="btn-buy-now" style={{ width: 'auto', marginTop: 16, padding: '8px 24px' }} onClick={handleReset}>
                Xóa bộ lọc
              </button>
            </div>
          )}

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="pagination-wrap">
              <Pagination
                current={currentPage}
                pageSize={PAGE_SIZE}
                total={filtered.length}
                onChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                showSizeChanger={false}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
