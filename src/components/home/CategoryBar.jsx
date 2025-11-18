import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { CATEGORY_DATA } from '../../constants/categories';

const CategoryBar = () => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const buttonRefs = useRef({});
  const closeTimeoutRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const animationTimeoutRef = useRef(null);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollLeft = container.scrollLeft;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;

      setShowLeftScroll(scrollLeft > 5);
      setShowRightScroll(scrollLeft < maxScrollLeft - 5);
    }
  };

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      handleScroll();
      container.addEventListener('scroll', handleScroll);

      const resizeObserver = new ResizeObserver(() => {
        handleScroll();
      });
      resizeObserver.observe(container);

      return () => {
        container.removeEventListener('scroll', handleScroll);
        resizeObserver.disconnect();
      };
    }
  }, []);

  const handleCategoryClick = (categoryName, isSubcategory = false) => {
    if (isSubcategory) {
      const parentCategory = CATEGORY_DATA.find(cat =>
        cat.subcategories.includes(categoryName)
      );
      if (parentCategory) {
        navigate(`/categories/${encodeURIComponent(parentCategory.name)}?subcategory=${encodeURIComponent(categoryName)}`);
      }
    } else {
      navigate(`/categories/${encodeURIComponent(categoryName)}`);
    }
    setMobileMenuOpen(false);
    setHoveredCategory(null);
  };

  const handleMouseEnter = (categoryName) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    const buttonElement = buttonRefs.current[categoryName];
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      const zoom = parseFloat(getComputedStyle(document.documentElement).zoom || 1);
      setDropdownPosition({
        top: (rect.bottom + window.scrollY + 8) / zoom,
        left: (rect.left + window.scrollX) / zoom
      });
    }

    setHoveredCategory(categoryName);
    setIsDropdownVisible(false);

    setTimeout(() => {
      setIsDropdownVisible(true);
    }, 10);
  };

  const handleMouseLeave = () => {
    setIsDropdownVisible(false);
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 200);
  };

  const handleDropdownEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    setIsDropdownVisible(true);
  };

  const handleDropdownLeave = () => {
    setIsDropdownVisible(false);
    animationTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 200);
  };

  return (
    <div className="bg-transparent">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 pb-2 pt-3">
        {/* desktop category bar */}
        <div className="hidden md:block">
          <div className="flex items-start gap-1.5 md:gap-6">
            <div className="flex-none w-14 md:w-32">
              <h2 className="font-semibold text-white text-lg md:text-2xl whitespace-nowrap pl-1 pt-2">
                <Link to="/categories" className="cursor-pointer hover:text-accent transition-colors">Categories</Link>
              </h2>
            </div>

            <div className="relative flex-1 min-w-0 group">
              {showLeftScroll && (
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
              )}

              {showRightScroll && (
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              )}

              <div
                ref={scrollContainerRef}
                className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth min-w-0"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  maskImage: showLeftScroll && showRightScroll
                    ? 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
                    : showLeftScroll
                      ? 'linear-gradient(to right, transparent 0%, black 5%, black 100%)'
                      : showRightScroll
                        ? 'linear-gradient(to right, black 0%, black 95%, transparent 100%)'
                        : 'none',
                  WebkitMaskImage: showLeftScroll && showRightScroll
                    ? 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
                    : showLeftScroll
                      ? 'linear-gradient(to right, transparent 0%, black 5%, black 100%)'
                      : showRightScroll
                        ? 'linear-gradient(to right, black 0%, black 95%, transparent 100%)'
                        : 'none'
                }}
              >
                {CATEGORY_DATA.map((category) => (
                  <div
                    key={category.name}
                    className="relative group"
                    onMouseEnter={() => handleMouseEnter(category.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      ref={el => buttonRefs.current[category.name] = el}
                      onClick={() => handleCategoryClick(category.name)}
                      className="flex items-center gap-1.5 px-6 h-14 bg-white hover:bg-gradient-to-b hover:from-white hover:to-green-50 rounded-full text-sm font-medium text-gray-800 transition-all whitespace-nowrap hover:cursor-pointer hover:shadow-md hover:-translate-y-0.5"
                      style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    >
                      {category.name}
                      {category.subcategories.length > 0 && (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {category.subcategories.length > 0 && hoveredCategory === category.name && createPortal(
                      <div
                        className={`bg-white rounded-xl border border-gray-200 shadow-xl py-3 w-[200px] ${
                          isDropdownVisible
                            ? 'opacity-100 scale-100 translate-y-0'
                            : 'opacity-0 scale-95 -translate-y-4'
                        }`}
                        style={{
                          position: 'fixed',
                          top: `${dropdownPosition.top}px`,
                          left: `${dropdownPosition.left}px`,
                          zIndex: 999999,
                          transformOrigin: 'top left',
                          transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onMouseEnter={handleDropdownEnter}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 mb-2">
                          {category.name}
                        </div>
                        <div className="space-y-0.5 px-2">
                          {category.subcategories.map((sub) => (
                            <button
                              key={sub}
                              onClick={() => handleCategoryClick(sub, true)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors rounded-lg font-medium hover:cursor-pointer"
                            >
                              {sub}
                            </button>
                          ))}
                        </div>

                        <div className="px-2 mb-1">
                          <button
                            onClick={() => handleCategoryClick(category.name, false)}
                            className="w-full text-left px-3 py-2 text-sm font-semibold text-green-600 hover:bg-green-50 transition-colors rounded-lg hover:cursor-pointer"
                          >
                            Shop All {category.name}
                          </button>
                        </div>
                      </div>,
                      document.body
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* mobile category dropdown */}
        <div className="md:hidden py-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-2 w-full px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-800 transition-all hover:cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            Categories
            <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {mobileMenuOpen && (
            <div className="mt-2 bg-white rounded-lg border border-gray-200 max-h-[400px] overflow-y-auto">
              {CATEGORY_DATA.map((category) => (
                <div key={category.name} className="border-b border-gray-100 last:border-0">
                  <button
                    onClick={() => handleCategoryClick(category.name, false)}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:cursor-pointer"
                  >
                    {category.name}
                  </button>
                  {category.subcategories.length > 0 && (
                    <div className="bg-gray-50 px-4 py-2 space-y-1">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => handleCategoryClick(sub, true)}
                          className="block w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:text-green-600 hover:cursor-pointer"
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;