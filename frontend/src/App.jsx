import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Layouts
import MerchantLayout from './layouts/MerchantLayout';
import AdminLayout from './layouts/AdminLayout';
import StorefrontLayout from './layouts/StorefrontLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Landing
import Landing from './pages/Landing';

// Merchant pages
import Dashboard from './pages/merchant/Dashboard';
import ProductList from './pages/merchant/ProductList';
import ProductForm from './pages/merchant/ProductForm';
import CategoryList from './pages/merchant/CategoryList';
import OrderList from './pages/merchant/OrderList';
import OrderDetail from './pages/merchant/OrderDetail';
import CustomerList from './pages/merchant/CustomerList';
import Appearance from './pages/merchant/Appearance';
import StoreSettings from './pages/merchant/StoreSettings';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StoreList from './pages/admin/StoreList';
import UserList from './pages/admin/UserList';

// Storefront pages
import Home from './pages/storefront/Home';
import ProductCatalog from './pages/storefront/ProductCatalog';
import ProductDetail from './pages/storefront/ProductDetail';
import Cart from './pages/storefront/Cart';
import Checkout from './pages/storefront/Checkout';

export default function App() {
  // Determine if this is a platform domain or a store subdomain
  const hostname = window.location.hostname;
  const platformDomain = import.meta.env.VITE_PLATFORM_DOMAIN || 'apexmr.store';
  const isPlatform = hostname === 'localhost' ||
    hostname === platformDomain ||
    hostname === `www.${platformDomain}`;

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-center" />
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="stores" element={<StoreList />} />
              <Route path="users" element={<UserList />} />
            </Route>

            {/* Merchant dashboard routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute roles={['merchant']}>
                <MerchantLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id" element={<ProductForm />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="customers" element={<CustomerList />} />
              <Route path="appearance" element={<Appearance />} />
              <Route path="settings" element={<StoreSettings />} />
            </Route>

            {/* Storefront routes - for store subdomains */}
            {!isPlatform ? (
              <Route element={<StorefrontLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductCatalog />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
              </Route>
            ) : (
              <Route path="/" element={<Landing />} />
            )}

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
