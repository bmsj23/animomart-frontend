import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const { results: searchSuggestions, isSearching } = useSearch(query, {
    limit: 100,
    maxResults: 5,
    enableCache: true,
    debounceMs: 500
  });

  useEffect(() => {
    if (query.length >= 2 && searchSuggestions.length > 0) {
      setShowSuggestions(true);
    } else if (query.length < 2) {
      setShowSuggestions(false);
    }
  }, [query, searchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setQuery('');
      setShowSuggestions(false);
      setShowMobileSearch(false);
    }
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/products/${productId}`);
    setQuery('');
    setShowSuggestions(false);
    setShowMobileSearch(false);
  };

  const handleViewAllResults = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setQuery('');
      setShowSuggestions(false);
      setShowMobileSearch(false);
    }
  };

  return (
    <>
      {/* desktop: search area */}
      <div className="hidden md:flex flex-1 items-center">
        <div ref={searchRef} className="relative w-full max-w-4xl">
          <form onSubmit={handleSearch} className="w-full">
            <input
              aria-label="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full pr-44 h-14 pl-6 rounded-full bg-[#F5F5F5] text-gray-700 placeholder-gray-400 shadow-sm border border-transparent focus:outline-none focus:ring-0 text-base"
            />

            <button
              type="submit"
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-black text-white px-6 h-14 rounded-full shadow-md flex items-center justify-center gap-2 transition hover:bg-black/90 hover:cursor-pointer"
              aria-label="Search"
            >
              <span className="font-medium">Search</span>
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* search suggestions dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
              {isSearching ? (
                <div className="p-4 text-center text-gray text-sm">Searching...</div>
              ) : searchSuggestions.length > 0 ? (
                <>
                  <div className="py-2">
                    {searchSuggestions.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleSuggestionClick(product._id)}
                        className="w-full text-left px-4 py-3 hover:bg-surface transition-colors text-main text-sm hover:cursor-pointer"
                      >
                        {product.name}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-200">
                    <button
                      onClick={handleViewAllResults}
                      className="w-full px-4 py-3 text-primary hover:bg-surface transition-colors text-sm font-medium text-center hover:cursor-pointer"
                    >
                      View all results for &quot;{query}&quot;
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-gray text-sm">No results found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* mobile: search button (opens overlay) */}
      <button
        onClick={() => setShowMobileSearch(true)}
        className="md:hidden flex-1 h-10 px-3 rounded-full bg-[#F5F5F5] flex items-center gap-2 text-gray-400 text-sm hover:cursor-pointer"
      >
        <Search className="w-4 h-4" />
        <span>Search products...</span>
      </button>

      {/* mobile: full-screen search overlay */}
      {showMobileSearch && (
        <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
          {/* header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <button
              onClick={() => {
                setShowMobileSearch(false);
                setQuery('');
                setShowSuggestions(false);
              }}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>

            <form onSubmit={handleSearch} className="flex-1">
              <input
                autoFocus
                aria-label="Search products"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full h-10 px-4 rounded-full bg-[#F5F5F5] text-gray-700 placeholder-gray-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </form>
          </div>

          {/* search results */}
          <div className="flex-1 overflow-y-auto">
            {query.length < 2 ? (
              <div className="p-8 text-center text-gray text-sm">
                Type at least 2 characters to search
              </div>
            ) : isSearching ? (
              <div className="p-8 text-center text-gray text-sm">Searching...</div>
            ) : searchSuggestions.length > 0 ? (
              <div className="py-2">
                {searchSuggestions.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleSuggestionClick(product._id)}
                    className="w-full text-left px-4 py-4 hover:bg-surface transition-colors text-main border-b border-gray-100 hover:cursor-pointer"
                  >
                    {product.name}
                  </button>
                ))}
                <button
                  onClick={handleViewAllResults}
                  className="w-full px-4 py-4 text-primary hover:bg-surface transition-colors font-medium text-center hover:cursor-pointer"
                >
                  View all results for &quot;{query}&quot;
                </button>
              </div>
            ) : query.length >= 2 ? (
              <div className="p-8 text-center text-gray text-sm">No results found</div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;