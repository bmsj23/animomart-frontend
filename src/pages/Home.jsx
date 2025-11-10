import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Menu, ArrowRight } from 'lucide-react';
import { getProducts } from '../api/products';
import BentoBox from '../components/common/Bento';
import ProductCard from '../components/common/ProductCard';
import { CATEGORY_DATA } from '../constants/categories';
import { logger } from '../utils/logger';

// category bar component
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

  // check scroll position to show/hide scroll indicators
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
      // for subcategories, need to find parent category first
      const parentCategory = CATEGORY_DATA.find(cat =>
        cat.subcategories.includes(categoryName)
      );
      if (parentCategory) {
        navigate(`/categories/${encodeURIComponent(parentCategory.name)}?subcategory=${encodeURIComponent(categoryName)}`);
      }
    } else {
      // for main categories, go to category detail page
      navigate(`/categories/${encodeURIComponent(categoryName)}`);
    }
    setMobileMenuOpen(false);
    setHoveredCategory(null);
  };

  const handleMouseEnter = (categoryName) => {
    // clear any pending close timeoutv
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    // clear any pending animation timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    // calculate position first
    const buttonElement = buttonRefs.current[categoryName];
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      // account for css zoom (0.8) - divide by zoom level to get correct position
      const zoom = parseFloat(getComputedStyle(document.documentElement).zoom || 1);
      setDropdownPosition({
        top: (rect.bottom + window.scrollY + 8) / zoom,
        left: (rect.left + window.scrollX) / zoom
      });
    }

    // set category and start with invisible state
    setHoveredCategory(categoryName);
    setIsDropdownVisible(false);

    setTimeout(() => {
      setIsDropdownVisible(true);
    }, 10);
  };



  const handleMouseLeave = () => {
    // add a small delay before closing to allow mouse to reach dropdown
    setIsDropdownVisible(false);
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 200); // 200ms delay
  };

  const handleDropdownEnter = () => {
    // cancel close timeout when entering dropdown
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
    // close with animation
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
            {/* categories header */}
            <div className="flex-none w-14 md:w-32">
              <h2 className="font-semibold text-white text-lg md:text-2xl whitespace-nowrap pl-1 pt-2">Categories</h2>
            </div>

            {/* scroll container */}
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

              {/* scrollable category pills */}
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
                  className="flex items-center gap-1.5 px-6 h-14 bg-white hover:bg-white rounded-full text-sm font-medium text-gray-800 transition-all whitespace-nowrap hover:cursor-pointer"
                >
                  {category.name}
                  {category.subcategories.length > 0 && (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* dropdown */}
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

                    {/* shop all link */}
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
            className="flex items-center gap-2 w-full px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-800 transition-all"
          >
            <Menu className="w-4 h-4" />
            Categories
            <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="mt-2 bg-white rounded-lg border border-gray-200 max-h-[400px] overflow-y-auto">
              {CATEGORY_DATA.map((category) => (
                <div key={category.name} className="border-b border-gray-100 last:border-0">
                  <button
                    onClick={() => handleCategoryClick(category.name, false)}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    {category.name}
                  </button>
                  {category.subcategories.length > 0 && (
                    <div className="bg-gray-50 px-4 py-2 space-y-1">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => handleCategoryClick(sub, true)}
                          className="block w-full text-left px-3 py-1.5 text-xs text-gray-600 hover:text-green-600"
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

// section component
const Section = ({ title, viewAllLink, children, loading, onGreenBg = false }) => {
  const navigate = useNavigate();

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`font-serif text-3xl md:text-4xl mb-2 tracking-tight ${onGreenBg ? 'text-white' : 'text-main'}`}>{title}</h2>

        </div>

        {viewAllLink && !loading && (
          <button
            onClick={() => navigate(viewAllLink)}
            className={`group flex items-center align-text-top gap-2 transition-all font-medium text-sm md:text-base hover:cursor-pointer hover:gap-3 ${onGreenBg ? 'text-white hover:text-white/80' : 'text-primary hover:text-primary/80'}`}
          >
            <span className="hidden sm:inline">View All</span>
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-sm h-80 animate-pulse" />
          ))}
        </div>
      ) : (
        children
      )}
    </section>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivalsElectronics, setNewArrivalsElectronics] = useState([]);
  const [newArrivalsClothing, setNewArrivalsClothing] = useState([]);
  const [newArrivalsBooks, setNewArrivalsBooks] = useState([]);
  const [loading, setLoading] = useState({
    featured: true,
    electronics: true,
    clothing: true,
    books: true
  });

  useEffect(() => {
    fetchFeaturedProducts();
    fetchNewArrivalsByCategory('Electronics', setNewArrivalsElectronics, 'electronics');
    fetchNewArrivalsByCategory('Clothing', setNewArrivalsClothing, 'clothing');
    fetchNewArrivalsByCategory('Books', setNewArrivalsBooks, 'books');
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(prev => ({ ...prev, featured: true }));
      const response = await getProducts({
        limit: 8,
        sort: 'newest'
      });
      setFeaturedProducts(response.data.products || []);
    } catch (err) {
      logger.error('Failed to fetch featured products:', err);
    } finally {
      setLoading(prev => ({ ...prev, featured: false }));
    }
  };

  const fetchNewArrivalsByCategory = async (category, setter, loadingKey) => {
    try {
      setLoading(prev => ({ ...prev, [loadingKey]: true }));
      const response = await getProducts({
        category,
        limit: 8,
        sort: 'newest'
      });
      setter(response.data.products || []);
    } catch (err) {
      logger.error(`Failed to fetch ${category} new arrivals:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  return (
    <div className="min-h-screen">
      {/* green hero section (extends through featured products) */}
      <div className="relative bg-green-700 overflow-hidden">
        {/* noise texture overlay */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px'
          }}
        />

        {/* category bar */}
        <div className="relative z-10">
          <CategoryBar />
        </div>

        {/* bento section  */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <BentoBox />
          </div>
        </div>

        {/* featured products section */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8">
          <Section
            title="Featured Products"
            subtitle="Handpicked items just for you"
            viewAllLink="/browse"
            loading={loading.featured}
            onGreenBg={true}
          >
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {featuredProducts.slice(0, 8).map(product => (
                <ProductCard key={product._id} product={product} onGreenBg={true} />
              ))}
            </div>
          </Section>
        </div>

        {/* wave transition*/}
        <div className="absolute bottom-0 left-0 right-0 h-24">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,64 C240,100 480,100 720,80 C960,60 1200,40 1440,64 L1440,120 L0,120 Z"
              fill="rgb(249, 250, 251)"
            />
          </svg>
        </div>
      </div>

      {/* gray section for new arrivals and below */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-12">

          {/* New Arrivals (Electronics) */}
          <Section
          title="New Arrivals in Electronics"
          subtitle="Latest tech and gadgets"
          viewAllLink="/browse?category=Electronics&sort=newest"
          loading={loading.electronics}
        >
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {newArrivalsElectronics.slice(0, 8).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </Section>

        {/* New Arrivals (Clothing) */}
        <Section
          title="New Arrivals in Clothing"
          subtitle="Fresh styles and fashion"
          viewAllLink="/browse?category=Clothing&sort=newest"
          loading={loading.clothing}
        >
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {newArrivalsClothing.slice(0, 8).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </Section>

        {/* New Arrivals (Books) */}
        <Section
          title="New Arrivals in Books"
          subtitle="Latest reads and textbooks"
          viewAllLink="/browse?category=Books&sort=newest"
          loading={loading.books}
        >
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {newArrivalsBooks.slice(0, 8).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </Section>

        {/* {browse all cta} */}
        <div className="relative bg-surface rounded-sm border border-gray-100 p-12 md:p-16 text-center overflow-hidden mt-20">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5" />

          <div className="relative z-10">
            <h3 className="font-serif text-3xl md:text-5xl text-main mb-4 tracking-tight">
              Want to See More?
            </h3>
            <p className="text-gray text-base md:text-lg max-w-2xl mx-auto mb-8 font-light">
              Browse our complete collection of products with advanced filters
            </p>
            <button
              onClick={() => navigate('/browse')}
              className="group inline-flex items-center gap-3 bg-primary text-white px-10 py-4 rounded-full font-medium text-base md:text-lg hover:bg-primary/90 transition-all hover:gap-4 hover:cursor-pointer shadow-lg hover:shadow-xl"
            >
              Browse All Products
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
};

export default Home;