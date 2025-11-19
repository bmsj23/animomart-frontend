import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Package, ShoppingBag, AlertTriangle, LogOut, ChevronLeft, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Toast from '../common/Toast';
import { useState } from 'react';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: Home, color: 'blue' },
    { path: '/admin/users', label: 'Users', icon: Users, color: 'purple' },
    { path: '/admin/products', label: 'Products', icon: Package, color: 'amber' },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBag, color: 'green' },
    { path: '/admin/reports', label: 'Reports', icon: AlertTriangle, color: 'red' },
  ];

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 via-gray-50 to-gray-100" style={{ minHeight: '125vh' }}>
      {/* desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 sticky top-0 ${
          isSidebarOpen ? 'w-72' : 'w-20'
        }`}
        style={{ height: '125vh' }}
      >
        {/* logo section */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200">
          {isSidebarOpen ? (
            <>
              <Link to="/" className="flex items-center gap-3 group hover:cursor-pointer">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                  <img src="/assets/LogoIcon_DarkGreen.png" alt="AnimoMart Logo" className="w-8 h-8 object-contain logo-bounce" />
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900">AnimoMart</p>
                  <p className="text-xs text-gray-500 font-medium">Admin Panel</p>
                </div>
              </Link>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-gray-500 transition-transform" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex justify-center hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                <img src="/assets/LogoIcon_DarkGreen.png" alt="AnimoMart Logo" className="w-8 h-8 object-contain logo-bounce logo-bounce--short" />
              </div>
            </button>
          )}
        </div>

        {/* navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center ${isSidebarOpen ? 'gap-4 px-4' : 'justify-center px-0'} py-2 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? `bg-${item.color}-50 text-${item.color}-800 shadow-sm`
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  isActive
                    ? `bg-${item.color}-100`
                    : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSidebarOpen && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* user section */}
        <div className="p-4 border-t border-gray-200">
          {isSidebarOpen ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2">
                <img
                  src={user?.profilePicture || 'https://via.placeholder.com/40'}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors hover:cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
          <span className="text-lg font-bold text-green-600">
            animomart
          </span>
        </Link>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
        >
          {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* mobile sidebar */}
      {isMobileSidebarOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="md:hidden fixed top-16 left-0 bottom-0 w-72 bg-white z-50 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                      isActive
                        ? `bg-${item.color}-50 text-${item.color}-600`
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                logout
              </button>
            </div>
          </aside>
        </>
      )}

      {/* main content */}
      <div className="flex-1 md:pt-0 pt-16 min-h-screen w-full" style={{ minHeight: '125vh' }}>
        <main className="p-4 sm:p-6 md:p-8 w-full max-w-[1600px] mx-auto min-h-screen" style={{ minHeight: '125vh' }}>
          {children}
        </main>
      </div>

      <Toast />
    </div>
  );
};

export default AdminLayout;