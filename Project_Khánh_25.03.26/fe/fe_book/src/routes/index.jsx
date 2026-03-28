import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ClientLayout from '../layouts/ClientLayout';
import HomePage from '../pages/client/HomePage';
import ProductsPage from '../pages/client/ProductsPage';
import ProductDetailPage from '../pages/client/ProductDetailPage';
import CartPage from '../pages/client/CartPage';
import LoginPage from '../pages/client/LoginPage';
import AccountLayout from '../pages/client/AccountLayout';
import OrdersPage from '../pages/client/OrdersPage';
import OrderDetailPage from '../pages/client/OrderDetailPage';
import ProfilePage from '../pages/client/ProfilePage';
import PasswordPage from '../pages/client/PasswordPage';
import SearchOrderPage from '../pages/client/SearchOrderPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ClientLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'order-tracking', element: <SearchOrderPage /> },
      { 
        path: 'account', 
        element: <AccountLayout />,
        children: [
          { index: true, element: <Navigate to="profile" replace /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'orders/:id', element: <OrderDetailPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'password', element: <PasswordPage /> },
        ]
      },
    ],
  },
]);



const AppRoutes = () => <RouterProvider router={router} />;

export default AppRoutes;
