import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Slider,
  Checkbox,
  Pagination,
  Select,
  Tag,
  Input,
  Empty,
  Spin,
} from 'antd';
import {
  FilterOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  SearchOutlined,
  CloseOutlined,
  BookOutlined,
  UserOutlined,
  BankOutlined,
} from '@ant-design/icons';
import {
  getAllSanPham,
  getAllTheLoai,
  getAllNhaXuatBan,
  getAllTacGia,
  getSanPhamByTheLoai,
  getSanPhamByNhaXuatBan,
  getSanPhamByTacGia,
} from '../../services/client/SanPhamCustomer';
import './ProductsPage.css';

const { Option } = Select;
const PAGE_SIZE = 16;

const getFirstImage = (hinhAnhs) => {
  if (!hinhAnhs || hinhAnhs.length === 0) return 'https://picsum.photos/seed/default/260/340';
  const url = hinhAnhs.find((img) => img && img.startsWith('http'));
  return url || 'https://picsum.photos/seed/default/260/340';
};

const mapProduct = (item) => ({
  id: item.id,
  title: item.tenSach,
  author: item.tenTacGias && item.tenTacGias.length > 0 ? item.tenTacGias.join(', ') : 'Chưa cập nhật',
  publisher: item.tenNhaXuatBan || 'Chưa cập nhật',
  price: item.giaBan || 0,
  stock: item.soLuong || 0,
  image: getFirstImage(item.hinhAnhs),
});

const BookCard = ({ product, onClick }) => {
  const { image, title, author, publisher, price } = product;

  return (
    <div className="book-card" onClick={() => onClick(product.id)} style={{ cursor: 'pointer' }}>
      <div className="book-image-wrap">
        <img src={image} alt={title} className="book-image" loading="lazy" />
        <div className="book-hover-overlay">
          <button className="overlay-btn" onClick={(e) => { e.stopPropagation(); onClick(product.id); }}>
            <EyeOutlined /> Xem chi tiết
          </button>
        </div>
      </div>

      <div className="book-info">
        <p className="book-author"><UserOutlined style={{ fontSize: 11, marginRight: 4 }} />{author}</p>
        <h3 className="book-title">{title}</h3>
        <p className="book-publisher" style={{ fontSize: 12, color: '#888', margin: '2px 0 6px' }}>
          <BankOutlined style={{ fontSize: 11, marginRight: 4 }} />{publisher}
        </p>

        <div className="book-price-row">
          <span className="book-price">{price.toLocaleString('vi-VN')}₫</span>
        </div>

        <div className="book-actions">
          <button className="btn-buy-now" onClick={(e) => { e.stopPropagation(); onClick(product.id); }}>
            <ShoppingCartOutlined /> Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({
  theLoais, activeTheLoai, onTheLoaiChange,
  nhaXuatBans, activeNhaXuatBan, onNhaXuatBanChange,
  tacGias, activeTacGia, onTacGiaChange,
  priceRange, onPriceChange,
  onReset,
}) => (
  <aside className="products-sidebar">
    <div className="sidebar-section">
      <h4 className="sidebar-title"><BookOutlined style={{ marginRight: 6 }} />Thể loại</h4>
      <ul className="cat-list">
        <li
          className={`cat-item ${activeTheLoai === null ? 'active' : ''}`}
          onClick={() => onTheLoaiChange(null)}
        >
          <span className="cat-label">Tất cả</span>
        </li>
        {theLoais.map((tl) => (
          <li
            key={tl.id}
            className={`cat-item ${activeTheLoai === tl.id ? 'active' : ''}`}
            onClick={() => onTheLoaiChange(tl.id)}
          >
            <span className="cat-label">{tl.tenTheLoai}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="sidebar-divider" />

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

    <div className="sidebar-section">
      <h4 className="sidebar-title"><BankOutlined style={{ marginRight: 6 }} />Nhà xuất bản</h4>
      <div className="checkbox-list">
        <div
          className={`cat-item ${activeNhaXuatBan === null ? 'active' : ''}`}
          style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 6, marginBottom: 4 }}
          onClick={() => onNhaXuatBanChange(null)}
        >
          Tất cả
        </div>
        {nhaXuatBans.map((nxb) => (
          <Checkbox
            key={nxb.id}
            checked={activeNhaXuatBan === nxb.id}
            onChange={() => onNhaXuatBanChange(activeNhaXuatBan === nxb.id ? null : nxb.id)}
            style={{ display: 'block', marginBottom: 6 }}
          >
            {nxb.tenNxb}
          </Checkbox>
        ))}
      </div>
    </div>

    <div className="sidebar-divider" />

    <div className="sidebar-section">
      <h4 className="sidebar-title"><UserOutlined style={{ marginRight: 6 }} />Tác giả</h4>
      <div className="checkbox-list">
        <div
          className={`cat-item ${activeTacGia === null ? 'active' : ''}`}
          style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 6, marginBottom: 4 }}
          onClick={() => onTacGiaChange(null)}
        >
          Tất cả
        </div>
        {tacGias.map((tg) => (
          <Checkbox
            key={tg.id}
            checked={activeTacGia === tg.id}
            onChange={() => onTacGiaChange(activeTacGia === tg.id ? null : tg.id)}
            style={{ display: 'block', marginBottom: 6 }}
          >
            {tg.tenTacGia}
          </Checkbox>
        ))}
      </div>
    </div>

    <div className="sidebar-divider" />

    <button className="btn-reset-filter" onClick={onReset}>
      <CloseOutlined /> Xóa bộ lọc
    </button>
  </aside>
);

const extractArray = (res) => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  if (res && Array.isArray(res.content)) return res.content;
  if (res && Array.isArray(res.result)) return res.result;
  return [];
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const [activeTheLoai, setActiveTheLoai] = useState(null);
  const [activeNhaXuatBan, setActiveNhaXuatBan] = useState(null);
  const [activeTacGia, setActiveTacGia] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [sortBy, setSortBy] = useState('default');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [theLoais, setTheLoais] = useState([]);
  const [nhaXuatBans, setNhaXuatBans] = useState([]);
  const [tacGias, setTacGias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [tlRes, nxbRes, tgRes] = await Promise.all([
          getAllTheLoai(),
          getAllNhaXuatBan(),
          getAllTacGia().catch(() => []),
        ]);

        const tlList = extractArray(tlRes);
        const nxbList = extractArray(nxbRes);
        const tgList = extractArray(tgRes);

        console.log('[Meta] Thể loại:', tlList);
        console.log('[Meta] Nhà xuất bản:', nxbList);
        console.log('[Meta] Tác giả:', tgList);

        setTheLoais(tlList);
        setNhaXuatBans(nxbList);
        setTacGias(tgList);
      } catch (err) {
        console.error('Lỗi tải meta:', err);
      }
    };
    loadMeta();
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setFilterLoading(true);
      let res;
      if (activeTheLoai !== null) {
        res = await getSanPhamByTheLoai(activeTheLoai);
      } else if (activeNhaXuatBan !== null) {
        res = await getSanPhamByNhaXuatBan(activeNhaXuatBan);
      } else if (activeTacGia !== null) {
        res = await getSanPhamByTacGia(activeTacGia);
      } else {
        res = await getAllSanPham();
      }

      const list = extractArray(res);
      console.log('[Products] Dữ liệu sản phẩm:', list);
      setAllProducts(list.map(mapProduct));
      setCurrentPage(1);
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
      setAllProducts([]);
    } finally {
      setFilterLoading(false);
      setLoading(false);
    }
  }, [activeTheLoai, activeNhaXuatBan, activeTacGia]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    let result = allProducts.filter((p) => {
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (searchText && !p.title.toLowerCase().includes(searchText.toLowerCase())) return false;
      return true;
    });

    // Sort
    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === 'name-asc') result = [...result].sort((a, b) => a.title.localeCompare(b.title, 'vi'));

    setDisplayProducts(result);
  }, [allProducts, priceRange, searchText, sortBy]);

  const paginated = displayProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleReset = () => {
    setActiveTheLoai(null);
    setActiveNhaXuatBan(null);
    setActiveTacGia(null);
    setPriceRange([0, 500000]);
    setSearchText('');
    setSortBy('default');
    setCurrentPage(1);
  };

  const handleTheLoaiChange = (id) => {
    setActiveTheLoai(id);
    setActiveNhaXuatBan(null);
    setActiveTacGia(null);
    setCurrentPage(1);
  };

  const handleNhaXuatBanChange = (id) => {
    setActiveNhaXuatBan(id);
    setActiveTheLoai(null);
    setActiveTacGia(null);
    setCurrentPage(1);
  };

  const handleTacGiaChange = (id) => {
    setActiveTacGia(id);
    setActiveTheLoai(null);
    setActiveNhaXuatBan(null);
    setCurrentPage(1);
  };

  const activeTheLoaiLabel = theLoais.find((t) => t.id === activeTheLoai)?.tenTheLoai;
  const activeNhaXuatBanLabel = nhaXuatBans.find((n) => n.id === activeNhaXuatBan)?.tenNxb;
  const activeTacGiaLabel = tacGias.find((t) => t.id === activeTacGia)?.tenTacGia;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Đang tải sản phẩm..." />
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-topbar">
        <div className="breadcrumb">
          <span style={{ cursor: 'pointer', color: '#666' }} onClick={() => navigate('/')}>Trang chủ</span>
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
        <Sidebar
          theLoais={theLoais}
          activeTheLoai={activeTheLoai}
          onTheLoaiChange={handleTheLoaiChange}
          nhaXuatBans={nhaXuatBans}
          activeNhaXuatBan={activeNhaXuatBan}
          onNhaXuatBanChange={handleNhaXuatBanChange}
          tacGias={tacGias}
          activeTacGia={activeTacGia}
          onTacGiaChange={handleTacGiaChange}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          onReset={handleReset}
        />

        <main className="products-main">
          <div className="products-toolbar">
            <div className="toolbar-left">
              <span className="result-count">
                <strong>{displayProducts.length}</strong> sản phẩm
                {activeTheLoaiLabel && (
                  <Tag color="blue" closable onClose={() => handleTheLoaiChange(null)} style={{ marginLeft: 8 }}>
                    Thể loại: {activeTheLoaiLabel}
                  </Tag>
                )}
                {activeNhaXuatBanLabel && (
                  <Tag color="green" closable onClose={() => handleNhaXuatBanChange(null)} style={{ marginLeft: 8 }}>
                    NXB: {activeNhaXuatBanLabel}
                  </Tag>
                )}
                {activeTacGiaLabel && (
                  <Tag color="purple" closable onClose={() => handleTacGiaChange(null)} style={{ marginLeft: 8 }}>
                    Tác giả: {activeTacGiaLabel}
                  </Tag>
                )}
              </span>
            </div>
            <div className="toolbar-right">
              <span className="sort-label">Sắp xếp:</span>
              <Select value={sortBy} onChange={setSortBy} className="sort-select" size="middle">
                <Option value="default">Mặc định</Option>
                <Option value="name-asc">Tên A → Z</Option>
                <Option value="price-asc">Giá tăng dần</Option>
                <Option value="price-desc">Giá giảm dần</Option>
              </Select>
            </div>
          </div>

          <Spin spinning={filterLoading}>
            {paginated.length > 0 ? (
              <div className="books-grid">
                {paginated.map((p) => (
                  <BookCard key={p.id} product={p} onClick={(id) => navigate(`/products/${id}`)} />
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
          </Spin>

          {displayProducts.length > PAGE_SIZE && (
            <div className="pagination-wrap">
              <Pagination
                current={currentPage}
                pageSize={PAGE_SIZE}
                total={displayProducts.length}
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