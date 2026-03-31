import { Button, Tag } from 'antd';
import { ShoppingCartOutlined, EyeOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const {
    image,
    title,
    author,
    price,
    originalPrice,
    rating = 4.5,
    sold = 0,
    badge,
  } = product;

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product.id}`)} style={{ cursor: 'pointer' }}>
      {/* Badge */}
      {badge && <div className={`card-badge badge-${badge.type}`}>{badge.label}</div>}
      {discount > 0 && (
        <div className="card-discount">-{discount}%</div>
      )}

      {/* Image */}
      <div className="card-image-wrap">
        <img src={image} alt={title} className="card-image" />
        <div className="card-overlay">
          {/* <Button
            type="primary"
            icon={<EyeOutlined />}
            className="btn-detail"
            size="small"
          >
            Xem Chi Tiết
          </Button> */}
        </div>
      </div>

      {/* Info */}
      <div className="card-body">
        <p className="card-author">{author}</p>
        <h3 className="card-title" title={title}>{title}</h3>

        {/* <div className="card-rating">
          <StarFilled className="star-icon" />
          <span className="rating-value">{rating}</span>
          <span className="sold-count">({sold} đã bán)</span>
        </div> */}

        <div className="card-price">
          <span className="price-current">
            {price.toLocaleString('vi-VN')}đ
          </span>
          {originalPrice && (
            <span className="price-original">
              {originalPrice.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>

        <div className="card-actions">
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            className="btn-buy"
            block
            onClick={(e) => e.stopPropagation()}
          >
            Mua Ngay
          </Button>
          <Button className="btn-view" block>
            Xem Chi Tiết
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;