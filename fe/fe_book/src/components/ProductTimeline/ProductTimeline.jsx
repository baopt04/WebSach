import { useRef } from 'react';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ProductCard from '../ProductCard/ProductCard';
import './ProductTimeline.css';

const ProductTimeline = ({ title, subtitle, products, accentColor = '#667eea' }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollRef.current;
    const amount = 500;
    container.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="product-timeline">
      <div className="timeline-header">
        <div className="timeline-title-wrap">
          <div className="timeline-accent" />
          <div>
            <h2 className="timeline-title">{title}</h2>
            {subtitle && <p className="timeline-subtitle">{subtitle}</p>}
          </div>
        </div>
        {/* <div className="timeline-nav-btns">
          <Button
            shape="circle"
            icon={<LeftOutlined />}
            className="nav-btn"
            onClick={() => scroll('left')}
          />
          <Button
            shape="circle"
            icon={<RightOutlined />}
            className="nav-btn"
            onClick={() => scroll('right')}
          />
        </div> */}
      </div>

      {/* Scrollable cards */}
      <div className="timeline-scroll-wrapper">
        <div className="timeline-track" ref={scrollRef}>
          {products.map((product, index) => (
            <ProductCard key={product.id || index} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductTimeline;
