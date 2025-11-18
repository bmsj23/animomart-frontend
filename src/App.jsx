import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import SellerLayout from './components/layout/SellerLayout';
import Navbar from './components/layout/Navbar';
import Toast from './components/common/Toast';

// pages
import Login from './pages/Login';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Categories from './pages/Categories';
import CategoryDetail from './pages/CategoryDetail';
import ProductDetail from './pages/ProductDetail';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Sell from './pages/Sell';
import MyReports from './pages/MyReports';

// admin pages
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Reports from './pages/admin/Reports';

// seller pages
import SellerDashboard from './pages/seller/Dashboard';
import SellerProducts from './pages/seller/Products';
import ProductForm from './pages/seller/ProductForm';
import SellerOrders from './pages/seller/Orders';
import SellerOrderDetail from './pages/seller/OrderDetail';
import BuyerOrderDetail from './pages/OrderDetail';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AdminProvider>
            <CartProvider>
              <WishlistProvider>
                <SocketProvider>
                  <Routes>
              {/* Public Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes with Main Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Home />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/browse"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Browse />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Categories />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories/:categoryName"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <CategoryDetail />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/:id"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ProductDetail />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Search />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Cart />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Wishlist />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Checkout />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout/success/:orderId"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <CheckoutSuccess />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <div className="h-screen flex flex-col overflow-hidden">
                      <Navbar />
                      <Messages />
                      <Toast />
                    </div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Profile />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-reports"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <MyReports />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <BuyerOrderDetail />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sell"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Sell />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes with Admin Layout */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <Dashboard />
                    </AdminLayout>
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <Users />
                    </AdminLayout>
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <Products />
                    </AdminLayout>
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <Orders />
                    </AdminLayout>
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <Reports />
                    </AdminLayout>
                  </AdminRoute>
                }
              />

              {/* Seller Routes with Seller Layout */}
              <Route
                path="/seller/dashboard"
                element={
                  <ProtectedRoute>
                    <SellerLayout>
                      <SellerDashboard />
                    </SellerLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller/products"
                element={
                  <ProtectedRoute>
                    <SellerLayout>
                      <SellerProducts />
                    </SellerLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller/products/new"
                element={
                  <ProtectedRoute>
                    <SellerLayout>
                      <ProductForm />
                    </SellerLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller/products/:id/edit"
                element={
                  <ProtectedRoute>
                    <SellerLayout>
                      <ProductForm />
                    </SellerLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller/orders"
                element={
                  <ProtectedRoute>
                    <SellerLayout>
                      <SellerOrders />
                    </SellerLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller/orders/:id"
                element={
                  <ProtectedRoute>
                    <SellerLayout>
                      <SellerOrderDetail />
                    </SellerLayout>
                  </ProtectedRoute>
                }
              />

              {/* catch all (redirect to home) */}
              <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </SocketProvider>
              </WishlistProvider>
            </CartProvider>
          </AdminProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;