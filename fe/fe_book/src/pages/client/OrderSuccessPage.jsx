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

  const maHoaDon = location.state?.maHoaDon || vnpParams?.vnp_TxnRef || null;

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
        title={<span style={{ fontSize: '32px', fontWeight: 800, color: '#1677ff' }}>ĐẶT HÀNG THÀNH CÔNG! 🎉</span>}
        subTitle={
          <div style={{ marginTop: '16px', lineHeight: '1.6' }}>
            {verifyMessage && isVnpReturn && (
              <p style={{ fontSize: '18px', color: '#52c41a', fontWeight: 'bold', marginBottom: '12px' }}>
                {verifyMessage}
              </p>
            )}
            <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '8px' }}>
              Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng của chúng tôi.
            </p>
            <p style={{ fontSize: '16px', color: '#4b5563' }}>
              Hệ thống đang xử lý đơn hàng và sẽ giao đến bạn trong thời gian sớm nhất.
            </p>
            
            {maHoaDon && (
              <div style={{
                background: '#f0fdf4',
                padding: '24px',
                borderRadius: '16px',
                marginTop: '32px',
                marginBottom: '16px',
                border: '1px dashed #bbf7d0',
                display: 'inline-block',
                minWidth: '280px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}>
                <p style={{ margin: 0, color: '#166534', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Mã đơn hàng của bạn</p>
                <div style={{ margin: '8px 0 0 0', color: '#15803d', fontSize: '32px', fontWeight: 900, letterSpacing: '3px' }}>
                  {maHoaDon}
                </div>
              </div>
            )}
          </div>
        }
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
