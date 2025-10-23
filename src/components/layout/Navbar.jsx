import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, ChevronDown, Menu, X, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="flex items-center h-20 gap-6">
          {/* Logo: compact stacked ANIMO / MART */}
          <Link to="/" className="flex items-center justify-center flex-none w-36">
            <div className="bg-white rounded-md px-2 py-1 shadow-sm w-full">
              <div className="font-logo text-black font-medium leading-snug text-center">
                <span className="block text-base md:text-lg">ANIMO</span>
                <span className="block text-base md:text-lg">MART</span>
              </div>
            </div>
          </Link>

          {/* Large search area */}
          <div className="flex-1 flex items-center">
            <div className="relative w-full max-w-4xl">
              <input
                aria-label="Search products"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Sofa set"
                className="w-full pr-44 h-14 pl-6 rounded-full bg-[#F5F5F5] text-gray-700 placeholder-gray-400 shadow-sm border border-transparent focus:outline-none focus:ring-0"
              />

              {/* Integrated matte black search button */}
              <button
                onClick={() => navigate(`/search?q=${encodeURIComponent(query || '')}`)}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black text-white px-6 h-14 rounded-full shadow-md flex items-center gap-2 hover:opacity-95"
              >
                <span className="font-medium">Search</span>
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action pills and profile */}
          <div className="flex items-center gap-2">
            <Link to="/sell" className="bg-white px-10 h-14 rounded-full shadow-sm text-black flex items-center justify-center">Sell</Link>

            <Link to="/messages" className="bg-white px-5 h-14 rounded-full shadow-sm flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-black" />
            </Link>

            <Link to="/favorites" className="bg-white px-5 h-14 rounded-full shadow-sm flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500" />
            </Link>

            <Link to="/cart" className="bg-gray-100 px-5 h-14 rounded-full shadow-sm flex items-center justify-center relative">
              <ShoppingCart className="w-6 h-6 text-black" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Profile avatar matching search height */}
            <div>
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="relative z-10 w-14 h-14 rounded-full border-2 border-white shadow-md overflow-hidden">
                <img
                  src={user?.profilePicture || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-16 w-48 bg-white rounded-lg shadow-lg py-2">
                  <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileOpen(false)}>
                    My Profile
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  <hr className="my-2" />
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden ml-3">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg hover:bg-gray-100">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu (simplified) */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <Link to="/" className="block py-2 text-gray-700">Home</Link>
            <Link to="/categories" className="block py-2 text-gray-700">Categories</Link>
            <Link to="/sell" className="block py-2 text-gray-700">Sell</Link>
            <Link to="/search" className="block py-2 text-gray-700">Search</Link>
            <Link to="/favorites" className="block py-2 text-gray-700">Favorites</Link>
            <Link to="/cart" className="block py-2 text-gray-700">Cart {itemCount > 0 && `(${itemCount})`}</Link>
            <Link to="/messages" className="block py-2 text-gray-700">Messages</Link>
            <Link to="/profile" className="block py-2 text-gray-700">Profile</Link>
            {isAdmin && <Link to="/admin" className="block py-2 text-gray-700">Admin Dashboard</Link>}
            <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
