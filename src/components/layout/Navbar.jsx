import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-bold text-green-600">AnimoMart</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors">
              Home
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-green-600 transition-colors">
              Categories
            </Link>
            <Link to="/sell" className="text-gray-700 hover:text-green-600 transition-colors">
              Sell
            </Link>
            <Link to="/messages" className="text-gray-700 hover:text-green-600 transition-colors">
              Messages
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Icon */}
            <button
              onClick={() => navigate('/search')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Favorites Icon */}
            <Link to="/favorites" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>

            {/* Cart Icon with Badge */}
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <img
                  src={user?.profilePicture || 'https://via.placeholder.com/40'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    My Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <Link to="/" className="block py-2 text-gray-700 hover:text-green-600">
              Home
            </Link>
            <Link to="/categories" className="block py-2 text-gray-700 hover:text-green-600">
              Categories
            </Link>
            <Link to="/sell" className="block py-2 text-gray-700 hover:text-green-600">
              Sell
            </Link>
            <Link to="/search" className="block py-2 text-gray-700 hover:text-green-600">
              Search
            </Link>
            <Link to="/favorites" className="block py-2 text-gray-700 hover:text-green-600">
              Favorites
            </Link>
            <Link to="/cart" className="block py-2 text-gray-700 hover:text-green-600">
              Cart {itemCount > 0 && `(${itemCount})`}
            </Link>
            <Link to="/messages" className="block py-2 text-gray-700 hover:text-green-600">
              Messages
            </Link>
            <Link to="/profile" className="block py-2 text-gray-700 hover:text-green-600">
              Profile
            </Link>
            {isAdmin && (
              <Link to="/admin" className="block py-2 text-gray-700 hover:text-green-600">
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="block w-full text-left py-2 text-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
