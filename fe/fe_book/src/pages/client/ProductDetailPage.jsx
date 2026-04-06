import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getChiTietSanPham, validateSoLuongSanPham } from '../../services/client/SanPhamCustomer';
import { addCartItem } from '../../services/client/CartCustomerService';
import { useCart } from '../../context/CartContext';
import { Rate, InputNumber, Tabs, Tag, Breadcrumb, message } from 'antd';
import {
  ShoppingCartOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  ShareAltOutlined,
  CheckCircleFilled,
  TruckOutlined,
  SafetyCertificateOutlined,
  RedoOutlined,
  StarFilled,
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  TagOutlined,
} from '@ant-design/icons';
import './ProductDetailPage.css';


const ImageGallery = ({ images }) => {
  const [selected, setSelected] = useState(0);

  return (
    <div className="gallery-wrap">
      <div className="gallery-main-img">
        <img src={images[selected]} alt="product" />
      </div>
      <div className="gallery-thumbs">
        {images.map((img, i) => (
          <div
            key={i}
            className={`gallery-thumb ${selected === i ? 'active' : ''}`}
            onClick={() => setSelected(i)}
          >
            <img src={img} alt={`thumb-${i}`} />
          </div>
        ))}
      </div>
    </div>
  );
};


const ProductInfo = ({ product }) => {
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();
  const { fetchCartCount } = useCart();
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discount = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const maxQty = Math.min(5, product.stock);

  const handleAddToCart = async () => {
    if (qty > maxQty) {
      message.warning(`Bạn chỉ được mua tối đa ${maxQty} sản phẩm!`);
      return;
    }

    const isLoggedIn = !!localStorage.getItem('token');

    if (isLoggedIn) {
      try {
        await validateSoLuongSanPham(product.id, qty);
        await addCartItem({ idSach: product.id, soLuong: qty });
        message.success("Thêm vào giỏ hàng thành công!");
        await fetchCartCount();
      } catch (error) {
        console.error(error);
        message.error(error.response?.data?.message || error.message || "Lỗi khi thêm vào giỏ hàng");
      }
    } else {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const existing = guestCart.find(item => item.idSach === product.id);
      if (existing) {
        if (existing.soLuong + qty > maxQty) {
          message.warning(`Giỏ hàng của bạn đã có ${existing.soLuong} sản phẩm này. Chỉ được mua tối đa ${maxQty}!`);
          return;
        }
        existing.soLuong += qty;
      } else {
        guestCart.push({
          idSach: product.id,
          idGioHangChiTiet: `guest_${product.id}`,
          tenSach: product.title,
          hinhAnh: product.images?.[0] || '',
          giaBan: product.price,
          soLuong: qty,
        });
      }
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      message.success("Thêm vào giỏ hàng thành công!");
      fetchCartCount();
      navigate('/cart');
    }
  };

  return (
    <div className="detail-info">
      <div className="detail-badges">
        <span className="badge-instock"><CheckCircleFilled /> Còn hàng </span>
      </div>

      <h1 className="detail-title">{product.title}</h1>
      <div className="detail-meta-row">
        <span className="meta-item">
          <UserOutlined /> Tác giả: <Link to="#" className="meta-link">{product.author}</Link>
        </span>
        <span className="meta-sep">|</span>
        <span className="meta-item">
          <BookOutlined /> NXB: <Link to="#" className="meta-link">{product.publisher}</Link>
        </span>
      </div>

      <div className="detail-price-box">
        <span className="price-current-1">{product.price?.toLocaleString('vi-VN')}₫</span>
        {hasDiscount && (
          <>
            <span className="price-original">{product.originalPrice?.toLocaleString('vi-VN')}₫</span>
            <span className="price-discount">-{discount}%</span>
          </>
        )}
      </div>



      {/* <ul className="detail-highlights">
        {product.highlights.map((h, i) => (
          <li key={i}><CheckCircleFilled className="check-icon" /> {h}</li>
        ))}
      </ul> */}

      <div className="detail-qty-row">
        <span className="qty-label">Số lượng:</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <InputNumber
            min={1}
            max={maxQty}
            value={qty}
            onChange={(val) => setQty(val || 1)}
            className="qty-input"
          />
          <span style={{ fontSize: '12px', color: '#888' }}>(Tối đa {maxQty} sản phẩm)</span>
        </div>
      </div>


      <div className="detail-cta">
        <button
          className="btn-buy-now-detail"
          onClick={() => {
            if (qty > maxQty) {
              message.warning(`Bạn chỉ được mua tối đa ${maxQty} sản phẩm!`);
              return;
            }
            const buyNowItem = {
              idSach: product.id,
              tenSach: product.title,
              hinhAnh: product.images?.[0] || '',
              giaBan: product.price,
              soLuong: qty,
            };
            navigate('/buy-now', { state: { item: buyNowItem } });
          }}
        >
          Mua Ngay
        </button>
        <button className="btn-add-cart" onClick={handleAddToCart}>
          <ShoppingCartOutlined /> Thêm Vào Giỏ
        </button>
      </div>


      <div className="detail-policies">
        <div className="policy-item">
          <TruckOutlined className="policy-icon" />
          <div>
            <p className="policy-title">Giao hàng nhanh</p>
            <p className="policy-desc">Miễn phí với đơn từ 150,000₫</p>
          </div>
        </div>
        <div className="policy-item">
          <SafetyCertificateOutlined className="policy-icon" />
          <div>
            <p className="policy-title">Cam kết chính hãng</p>
            <p className="policy-desc">100% sách thật, chất lượng đảm bảo</p>
          </div>
        </div>
        <div className="policy-item">
          <RedoOutlined className="policy-icon" />
          <div>
            <p className="policy-title">Đổi trả dễ dàng</p>
            <p className="policy-desc">30 ngày nếu sản phẩm lỗi</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await getChiTietSanPham(id);

        setProduct({
          id: data.id,
          title: data.tenSach,
          author: data.tenTacGias && data.tenTacGias.length > 0 ? data.tenTacGias.join(', ') : 'Chưa cập nhật',
          publisher: data.tenNhaXuatBan || 'Chưa cập nhật',
          translator: 'Chưa cập nhật',
          publishYear: data.namXuatBan || 'Chưa cập nhật',
          pages: data.soTrang || 0,
          size: data.kichThuoc || 'Chưa cập nhật',
          cover: 'Chưa cập nhật',
          language: data.ngonNgu || 'Chưa cập nhật',
          isbn: data.maSach || 'Chưa cập nhật',
          category: data.tenTheLoai || 'Chưa cập nhật',
          price: data.giaBan || 0,
          originalPrice: null,
          stock: data.soLuong || 0,
          sold: 0,
          rating: 4.8,
          reviewCount: 0,
          images: data.hinhAnhs && data.hinhAnhs.length > 0 ? data.hinhAnhs : ['https://picsum.photos/seed/book-detail-1/500/650'],
          tags: [],
          description: data.moTa || '<p>Chưa có mô tả cho sản phẩm này.</p>',
          highlights: [],
        });
      } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="detail-page" style={{ padding: '100px 0', textAlign: 'center' }}>Đang tải...</div>;
  }

  if (!product) {
    return <div className="detail-page" style={{ padding: '100px 0', textAlign: 'center' }}>Không tìm thấy sản phẩm.</div>;
  }


  const tabItems = [
    {
      key: 'desc',
      label: <span><FileTextOutlined /> Mô tả sách</span>,
      children: (
        <div className="tab-desc">
          {product.highlights && product.highlights.length > 0 && (
            <div className="highlights-box">
              <h4>Điểm nổi bật</h4>
              <ul>
                {product.highlights.map((h, i) => (
                  <li key={i}><CheckCircleFilled className="check-icon" /> {h}</li>
                ))}
              </ul>
            </div>
          )}
          <div
            className="desc-content"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      ),
    },
    {
      key: 'specs',
      label: <span><TagOutlined /> Thông tin chi tiết</span>,
      children: (
        <div className="tab-specs">
          <table className="specs-table">
            <tbody>
              {[
                ['Tác giả', product.author],
                ['Nhà xuất bản', product.publisher],
                ['Người dịch', product.translator],
                ['Năm xuất bản', product.publishYear],
                ['Số trang', `${product.pages} trang`],
                ['Kích thước', product.size],
                ['Loại bìa', product.cover],
                ['Ngôn ngữ', product.language],
                ['ISBN', product.isbn],
                ['Danh mục', product.category],
              ].map(([label, val]) => (
                <tr key={label}>
                  <td className="spec-label">{label}</td>
                  <td className="spec-val">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },

  ];

  return (
    <div className="detail-page">
      <Breadcrumb
        className="detail-breadcrumb"
        items={[
          { title: <Link to="/">Trang chủ</Link> },
          { title: <Link to="/products">Sản phẩm</Link> },
          { title: product.title },
        ]}
      />

      <div className="detail-main">
        <ImageGallery images={product.images} />
        <ProductInfo product={product} />
      </div>

      <div className="detail-tabs-wrap">
        <Tabs defaultActiveKey="desc" items={tabItems} className="detail-tabs" />
      </div>


      <div className="related-section">
        <div className="related-header">
          <h2 className="related-title">Sách có thể bạn thích</h2>
        </div>
        <div className="related-grid">
          <p style={{ textAlign: 'center', width: '100%', color: '#888' }}>Chưa có tính năng liên quan</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;