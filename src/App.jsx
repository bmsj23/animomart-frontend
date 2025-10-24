import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import Navbar from './components/layout/Navbar';
import Toast from './components/common/Toast';

// pages
import Login from './pages/Login';
import Home from './pages/Home';
import Categories from './pages/Categories';
import ProductDetail from './pages/ProductDetail';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import Checkout from './pages/Checkout';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Sell from './pages/Sell';

// admin pages
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Reports from './pages/admin/Reports';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <ToastProvider>
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
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Favorites />
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

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
