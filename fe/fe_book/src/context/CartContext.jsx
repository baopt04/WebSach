import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCartDetails } from '../services/client/CartCustomerService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    try {
      const data = await getCartDetails();
      if (data && data.chiTietList) {
        // Số lượng theo sản phẩm khác nhau (loại sản phẩm)
        setCartCount(data.chiTietList.length);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error("Lỗi lấy số lượng giỏ hàng:", error);
      setCartCount(0);
    }
  };

  const clearCartCount = () => {
    setCartCount(0);
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchCartCount();
    }
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount, clearCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
