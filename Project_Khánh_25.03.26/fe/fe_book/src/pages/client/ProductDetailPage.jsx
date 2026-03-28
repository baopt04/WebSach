import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Rate, InputNumber, Tabs, Tag, Breadcrumb } from 'antd';
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

const mockProduct = {
  id: 1,
  title: 'Đắc Nhân Tâm – How to Win Friends and Influence People',
  author: 'Dale Carnegie',
  publisher: 'NXB Tổng Hợp TP.HCM',
  translator: 'Nguyễn Hiến Lê',
  publishYear: 2023,
  pages: 320,
  size: '20.5 x 14.5 cm',
  cover: 'Bìa mềm',
  language: 'Tiếng Việt',
  isbn: '978-604-54-7823-1',
  category: 'Kỹ năng sống',
  price: 89000,
  originalPrice: 120000,
  stock: 142,
  sold: 25610,
  rating: 4.8,
  reviewCount: 1243,
  images: [
    'https://picsum.photos/seed/book-detail-1/500/650',
    'https://picsum.photos/seed/book-detail-2/500/650',
    'https://picsum.photos/seed/book-detail-3/500/650',
    'https://picsum.photos/seed/book-detail-4/500/650',
  ],
  tags: ['Kỹ năng giao tiếp', 'Tâm lý học', 'Bestseller', 'Kinh điển'],
  description: `<p><strong>Đắc Nhân Tâm</strong> (How to Win Friends and Influence People) là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại do Dale Carnegie viết.</p>
<p>Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia. Hàng triệu bản sách đã được bán ra kể từ khi xuất bản.</p>
<p>Đây không chỉ là cuốn sách dạy bạn cách tạo ấn tượng đầu tiên mà còn dạy cách tạo ra những mối quan hệ bền vững, cách trở thành người lãnh đạo thực sự, và cách sống một cuộc đời ý nghĩa hơn.</p>
<p>Những nguyên tắc mà Dale Carnegie đúc kết trong cuốn sách này đã giúp hàng triệu người trên thế giới thay đổi cuộc đời theo hướng tích cực hơn, giúp họ thành công hơn trong sự nghiệp, hạnh phúc hơn trong cuộc sống.</p>`,
  highlights: [
    'Nghệ thuật giao tiếp và tạo ấn tượng với người khác',
    'Bí quyết để trở thành người lãnh đạo được yêu mến',
    'Kỹ năng thuyết phục và tác động đến suy nghĩ của người khác',
    'Cách xây dựng các mối quan hệ bền chặt và lâu dài',
  ],
};

const relatedBooks = Array.from({ length: 5 }, (_, i) => ({
  id: i + 10,
  image: `https://picsum.photos/seed/related${i}/200/270`,
  title: ['Nhà Giả Kim', 'Atomic Habits', 'Sapiens', 'Tư Duy Nhanh Và Chậm', 'Zero To One'][i],
  author: ['Paulo Coelho', 'James Clear', 'Y. N. Harari', 'D. Kahneman', 'Peter Thiel'][i],
  price: [125000, 98000, 179000, 145000, 139000][i],
  rating: [4.7, 4.9, 4.6, 4.5, 4.4][i],
}));





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
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

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
        <span className="price-current-1">{product.price.toLocaleString('vi-VN')}₫</span>
        <span className="price-original">{product.originalPrice.toLocaleString('vi-VN')}₫</span>
        <span className="price-discount">-{discount}%</span>
      </div>



      {/* <ul className="detail-highlights">
        {product.highlights.map((h, i) => (
          <li key={i}><CheckCircleFilled className="check-icon" /> {h}</li>
        ))}
      </ul> */}

      <div className="detail-qty-row">
        <span className="qty-label">Số lượng:</span>
        <InputNumber
          min={1}
          max={product.stock}
          value={qty}
          onChange={setQty}
          className="qty-input"
        />
        <span className="qty-stock">{product.stock} sản phẩm có sẵn</span>
      </div>

      {/* CTA buttons */}
      <div className="detail-cta">
        <button className="btn-buy-now-detail">
          Mua Ngay
        </button>
        <button className="btn-add-cart">
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
  const product = mockProduct;

  const tabItems = [
    {
      key: 'desc',
      label: <span><FileTextOutlined /> Mô tả sách</span>,
      children: (
        <div className="tab-desc">
          <div className="highlights-box">
            <h4>Điểm nổi bật</h4>
            <ul>
              {product.highlights.map((h, i) => (
                <li key={i}><CheckCircleFilled className="check-icon" /> {h}</li>
              ))}
            </ul>
          </div>
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
          {relatedBooks.map((b) => (
            <Link to={`/products/${b.id}`} key={b.id} className="related-card">
              <div className="related-img-wrap">
                <img src={b.image} alt={b.title} />
              </div>
              <p className="related-author">{b.author}</p>
              <p className="related-name">{b.title}</p>
              <div className="related-bottom">
                <span className="related-price">{b.price.toLocaleString('vi-VN')}₫</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
