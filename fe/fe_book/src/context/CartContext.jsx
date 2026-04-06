import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCartDetails } from '../services/client/CartCustomerService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    try {
      if (!localStorage.getItem("token")) {
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        const total = guestCart.reduce((sum, item) => sum + (Number(item.soLuong) || 0), 0);
        setCartCount(total);
        return;
      }
      const data = await getCartDetails();
      if (data && data.chiTietList) {
        const total = data.chiTietList.reduce((sum, line) => sum + (Number(line.soLuong) || 0), 0);
        setCartCount(total);
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
    fetchCartCount();
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
