import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, ShoppingOutlined } from '@ant-design/icons';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = location.state?.isLoggedIn ?? !!localStorage.getItem('token');

  return (
    <div className="order-success-container">
      <Result
        status="success"
        title="Đặt hàng thành công!"
        subTitle="Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng của chúng tôi. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn."
        extra={[
          <Button 
            type="primary" 
            key="home" 
            icon={<HomeOutlined />} 
            size="large"
            onClick={() => navigate('/')}
            className="success-btn home-btn"
          >
            Trang chủ
          </Button>,
          <Button 
            key="orders" 
            icon={<ShoppingOutlined />} 
            size="large"
            onClick={() => navigate(isLoggedIn ? '/account/orders' : '/order-tracking')}
            className="success-btn orders-btn"
          >
            Đơn hàng của tôi
          </Button>,
        ]}
      />
    </div>
  );
};

export default OrderSuccessPage;
