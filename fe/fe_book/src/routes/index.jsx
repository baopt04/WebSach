import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ClientLayout from '../layouts/ClientLayout';
import AdminLayout from '../layouts/AdminLayout';

// Client pages
import HomePage from '../pages/client/HomePage';
import ProductsPage from '../pages/client/ProductsPage';
import ProductDetailPage from '../pages/client/ProductDetailPage';
import CartPage from '../pages/client/CartPage';
import BuyNowPage from '../pages/client/BuyNowPage';
import LoginPage from '../pages/client/LoginPage';
import AccountLayout from '../pages/client/AccountLayout';
import OrdersPage from '../pages/client/OrdersPage';
import OrderDetailPage from '../pages/client/OrderDetailPage';
import ProfilePage from '../pages/client/ProfilePage';
import PasswordPage from '../pages/client/PasswordPage';
import SearchOrderPage from '../pages/client/SearchOrderPage';
import OrderSuccessPage from '../pages/client/OrderSuccessPage';

import DashboardPage from '../pages/admin/DashboardPage';
// import AdminProductsPage from '../pages/admin/ProductsPage';
import CouponsPage from '../pages/admin/CouponsPage';
import AdminOrdersPage from '../pages/admin/OrdersPage';
import AccountsPage from '../pages/admin/AccountsPage';
import AuthorsPage from '../pages/admin/AuthorsPage';
import CategoriesPage from '../pages/admin/CategoriesPage';
import StatisticsPage from '../pages/admin/StatisticsPage';
import POSPage from '../pages/admin/POSPage';
import OrderDetailAdmin from '../pages/admin/OrderDetailAdmin';
import PublishersPage from '../pages/admin/PublishersPage';
import ProductsPageAdmin from '../pages/admin/ProductsPage';
import ProductFormPage from '../pages/admin/ProductFormPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ClientLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'buy-now', element: <BuyNowPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'order-tracking', element: <SearchOrderPage /> },
      { path: 'order-success', element: <OrderSuccessPage /> },
      {
        path: 'account',
        element: <AccountLayout />,
        children: [
          { index: true, element: <Navigate to="profile" replace /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'orders/:id', element: <OrderDetailPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'password', element: <PasswordPage /> },
        ],
      },
    ],
  },

  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'products', element: <ProductsPageAdmin /> },
      { path: 'products/new', element: <ProductFormPage /> },
      { path: 'products/edit/:id', element: <ProductFormPage /> },
      { path: 'coupons', element: <CouponsPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'orders/:id', element: <OrderDetailAdmin /> },
      { path: 'accounts', element: <AccountsPage /> },
      { path: 'authors', element: <AuthorsPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'publishers', element: <PublishersPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'pos', element: <POSPage /> },
    ],
  },
]);



const AppRoutes = () => <RouterProvider router={router} />;

export default AppRoutes;