import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, ShoppingCart, ChevronDown, Menu, X, MessageSquare, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import SearchBar from './SearchBar';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
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

  return (
    <nav className="bg-gray-50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center h-16 md:h-20 gap-1.5 md:gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center flex-none w-14 md:w-32">
            <div className="bg-white rounded-md px-3 py-2.5 md:px-6 md:py-2 shadow-sm">
              <img src="tr_animomart_1.png" alt="AnimoMart" className="h-5 md:h-10 w-auto" />
            </div>
          </Link>

          {/* search bar component */}
          <SearchBar />

          {/* desktop: action buttons */}
          <div className="hidden md:flex items-center gap-2">

            <Link
              to="/sell"
              className="bg-[rgb(var(--color-primary))] text-white px-6 h-14 rounded-full shadow-sm flex items-center gap-2 justify-center hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition transform duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
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
              to="/favorites"
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
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="relative z-10 w-14 h-14 rounded-full border-2 border-white shadow-md overflow-hidden profile-btn hover:cursor-pointer">
                <img
                  src={user?.profilePicture || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                  <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileOpen(false)}>
                    My Profile
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  <hr className="my-2" />
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:cursor-pointer hover:bg-red-100">
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
                    <img
                      src={user?.profilePicture || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60'}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
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
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">My Profile</span>
                  </Link>

                  <Link
                    to="/sell"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Sell Item</span>
                  </Link>

                  <Link
                    to="/favorites"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5" />
                    <span className="font-medium">Favorites</span>
                  </Link>

                  <Link
                    to="/messages"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">Messages</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ChevronDown className="w-5 h-5" />
                      <span className="font-medium">Admin Dashboard</span>
                    </Link>
                  )}

                  <hr className="my-4" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition text-red-600 font-medium"
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