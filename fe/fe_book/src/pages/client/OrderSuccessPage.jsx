import React, { useEffect, useMemo, useState } from 'react';
import { Result, Button, Spin } from 'antd';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { HomeOutlined, ShoppingOutlined } from '@ant-design/icons';
import './OrderSuccessPage.css';
import { vnpayCallback } from '../../services/client/VNPayCustomerService';
import { useCart } from '../../context/CartContext';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { clearCartCount } = useCart();
  const isLoggedIn = location.state?.isLoggedIn ?? !!localStorage.getItem('token');

  const vnpParams = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const isVnpReturn = useMemo(
    () => !!vnpParams?.vnp_ResponseCode || !!vnpParams?.vnp_TxnRef,
    [vnpParams]
  );

  const [verifying, setVerifying] = useState(false);
  const [verifyOk, setVerifyOk] = useState(null);
  const [verifyMessage, setVerifyMessage] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!isVnpReturn) return;
      setVerifying(true);
      try {
        await vnpayCallback(vnpParams);
        setVerifyOk(true);
        setVerifyMessage('Đặt hàng thành công!');
        if (isLoggedIn) clearCartCount();
        localStorage.removeItem('guestCart');
      } catch (e) {
        setVerifyOk(false);
        setVerifyMessage(e?.message || 'Thanh toán không thành công');
      } finally {
        setVerifying(false);
      }
    };
    run();
  }, [isVnpReturn]);

  if (isVnpReturn && verifying) {
    return (
      <div className="order-success-container">
        <Spin size="large" />
      </div>
    );
  }

  if (isVnpReturn && verifyOk === false) {
    return (
      <div className="order-success-container">
        <Result
          status="error"
          title="Thanh toán không thành công"
          subTitle={verifyMessage}
          extra={[
            <Button
              type="primary"
              key="cart"
              size="large"
              onClick={() => navigate('/cart')}
              className="success-btn home-btn"
            >
              Quay lại giỏ hàng
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <Result
        status="success"
        title={isVnpReturn ? (verifyMessage || 'Đặt hàng thành công!') : 'Đặt hàng thành công!'}
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
