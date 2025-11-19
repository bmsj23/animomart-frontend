import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
  MessageSquare,
  Plus,
  Package,
  User,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import SearchBar from './SearchBar';
import ProfileAvatar from '../common/ProfileAvatar';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAdmin, isSeller } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const location = useLocation();
  const prevItemCountRef = useRef(0);
  const [bounce, setBounce] = useState(false);

  // bounce animation when cart count increases
  useEffect(() => {
    if (itemCount > prevItemCountRef.current && itemCount > 0) {
      setBounce(true);
      setTimeout(() => setBounce(false), 500);
    }
    prevItemCountRef.current = itemCount;
  }, [itemCount]);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  // Close profile dropdown on outside click, touch, or Escape key
  useEffect(() => {
    if (!isProfileOpen) return;

    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') setIsProfileOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isProfileOpen]);

  // Close dropdowns when route changes
  useEffect(() => {
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  // check if we're on home page to apply green background
  const isHomePage = location.pathname === '/';

  const baseProfileLinks = [
    { label: 'My Profile', to: '/profile', icon: User },
    { label: 'Wishlist', to: '/wishlist', icon: Heart },
    { label: 'Messages', to: '/messages', icon: MessageSquare },
    { label: 'My Reports', to: '/my-reports', icon: FileText }
  ];

  const profileLinks = [...baseProfileLinks];

  if (isSeller) {
    profileLinks.push({ label: 'Seller Dashboard', to: '/seller/dashboard', icon: Package });
  }

  if (isAdmin) {
    profileLinks.push({ label: 'Admin Dashboard', to: '/admin', icon: ShieldCheck });
  }

  return (
    <nav className={`sticky top-0 z-40 transition-colors duration-300 ${isHomePage ? 'bg-green-900 shadow-none' : 'bg-gray-50'}`}>
      {/* noise texture overlay for home page */}
      {isHomePage && (
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px'
          }}
        />
      )}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 relative z-10">
        <div className="flex items-center h-16 md:h-20 gap-1.5 md:gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center flex-none w-14 md:w-32">
            <div className="bg-white rounded-md px-3 py-2.5 md:px-6 md:py-2 shadow-sm">
              <img src="/assets/tr_animomart_1.png" alt="AnimoMart" className="h-5 md:h-10 w-auto logo-bounce" />
            </div>
          </Link>

          {/* search bar component */}
          <SearchBar />

          {/* desktop: action buttons */}
          <div className="hidden md:flex items-center gap-2">

            <Link
              to="/sell"
              className="bg-emerald-700 text-white px-6 h-14 rounded-full shadow-sm flex items-center gap-2 justify-center hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition transform duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Sell</span>
            </Link>

            <Link
              to="/messages"
              className="bg-white px-5 h-14 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 hover:shadow-lg hover:-translate-y-0.5 transition transform duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-200"
            >
              <MessageSquare className="w-5 h-5 text-black" />
            </Link>

            <Link
              to="/wishlist"
              className="group bg-white px-5 h-14 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 hover:shadow-lg hover:-translate-y-0.5 transition transform duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-200"
            >
              <Heart className="w-5 h-5 text-red-500 transform transition duration-150 group-hover:scale-105" />
            </Link>

            <Link
              to="/cart"
              className="bg-gray-100 px-5 h-14 rounded-full shadow-sm flex items-center justify-center relative hover:bg-gray-50 hover:shadow-lg hover:-translate-y-0.5 transition transform duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-200"
            >
              <ShoppingCart className="w-6 h-6 text-black" />
              {itemCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 bg-black text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-transform ${
                    bounce ? 'animate-bounce' : ''
                  }`}
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Profile avatar matching search height */}
            <div ref={profileRef} className="relative">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="relative z-10 hover:cursor-pointer">
                <ProfileAvatar user={user} size="lg" />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-3 w-72 rounded-3xl border border-gray-100 bg-white shadow-2xl p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar user={user} size="md" className="border border-gray-200" />
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-900">{user?.name || 'Guest'}</p>
                      <p className="text-xs text-gray-500">{user?.email || '—'}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {profileLinks.map((item) => {
                      const IconElement = item.icon;
                      return (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-800 hover:cursor-pointer transition-colors"
                        >
                          <IconElement className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 hover:cursor-pointer transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* mobile: cart icon */}
          <Link
            to="/cart"
            className="md:hidden bg-white p-2 rounded-full shadow-sm hover:bg-gray-50 transition relative"
            aria-label="Cart"
          >
            <ShoppingCart className="w-4 h-4 text-gray-700" />
            {itemCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 bg-black text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center transition-transform ${
                  bounce ? 'animate-bounce' : ''
                }`}
              >
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>

          {/* mobile: menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden bg-white p-2 rounded-full shadow-sm hover:bg-gray-50 transition"
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="w-4 h-4 text-gray-700" /> : <Menu className="w-4 h-4 text-gray-700" />}
          </button>
        </div>

        {/* mobile: slide-in menu */}
        {isMenuOpen && (
          <>
            {/* backdrop */}
            <div
              className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* menu panel */}
            <div className="md:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto">
              <div className="p-6">
                {/* close button */}
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-6 h-6 text-gray-700" />
                </button>

                {/* profile section */}
                <div className="mb-8 pt-2">
                  <div className="flex items-center gap-4">
                    <ProfileAvatar user={user} size="xl" className="border-2 border-gray-200" />
                    <div>
                      <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* menu items */}
                <nav className="space-y-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 hover:cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">My Profile</span>
                  </Link>

                  {isSeller && (
                    <Link
                      to="/seller/dashboard"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 hover:cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Package className="w-5 h-5" />
                      <span className="font-medium">Seller Dashboard</span>
                    </Link>
                  )}

                  <Link
                    to="/sell"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 hover:cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Sell Item</span>
                  </Link>

                  <Link
                    to="/wishlist"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 hover:cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5" />
                    <span className="font-medium">Wishlist</span>
                  </Link>

                  <Link
                    to="/messages"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 hover:cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">Messages</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 hover:cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ChevronDown className="w-5 h-5" />
                      <span className="font-medium">Admin Dashboard</span>
                    </Link>
                  )}

                  <hr className="my-4" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition text-red-600 font-medium hover:cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;