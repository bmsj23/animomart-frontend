import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Menu, ArrowRight } from 'lucide-react';
import { getProducts } from '../api/products';
import BentoBox from '../components/common/Bento';
import ProductCard from '../components/common/ProductCard';
import { CATEGORY_DATA } from '../constants/categories';

// category bar component
const CategoryBar = () => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const buttonRefs = useRef({});
  const closeTimeoutRef = useRef(null);
  const scrollContainerRef = useRef(null);

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

    setHoveredCategory(categoryName);
    // calculate position for portal - align left edge with button's left edge
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
  };



  const handleMouseLeave = () => {
    // add a small delay before closing to allow mouse to reach dropdown
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 100); // 100ms delay
  };

  const handleDropdownEnter = () => {
    // cancel close timeout when entering dropdown
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleDropdownLeave = () => {
    // close immediately when leaving dropdown
    setHoveredCategory(null);
  };

  return (
    <div className="bg-gray-50 border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        {/* desktop category bar */}
        <div className="hidden md:flex items-center gap-4 py-3">
          <h2 className="font-semibold text-gray-900 text-lg pr-4 whitespace-nowrap">Categories</h2>

          {/* scroll container */}
          <div className="relative flex-1 min-w-0 group">
            {/* left fade & scroll button */}
            {showLeftScroll && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100 hover:cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
              </>
            )}

            {/* right fade & scroll button */}
            {showRightScroll && (
              <>
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100 hover:cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </>
            )}

            {/* scrollable category pills */}
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth min-w-0 pl-6 lg:pl-8"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
                  className="flex items-center gap-1.5 px-6 h-14 bg-gray-100 hover:bg-green-50 hover:text-green-600 rounded-full text-sm font-medium text-gray-700 transition-all whitespace-nowrap border border-transparent hover:border-green-200 hover:cursor-pointer"
                >
                  {category.name}
                  {category.subcategories.length > 0 && (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* dropdown */}
                {category.subcategories.length > 0 && hoveredCategory === category.name && createPortal(
                  <div
                    className="bg-white rounded-xl shadow-2xl border border-gray-200 py-3 w-[200px]"
                    style={{
                      position: 'fixed',
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                      zIndex: 999999
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

        {/* mobile category dropdown */}
        <div className="md:hidden py-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-2 w-full px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700"
          >
            <Menu className="w-4 h-4" />
            Categories
            <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[400px] overflow-y-auto">
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
const Section = ({ title, viewAllLink, children, loading }) => {
  const navigate = useNavigate();

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-main mb-2 tracking-tight">{title}</h2>

        </div>

        {viewAllLink && !loading && (
          <button
            onClick={() => navigate(viewAllLink)}
            className="group flex items-center align-text-top gap-2 text-primary hover:text-primary/80 transition-all font-medium text-sm md:text-base hover:cursor-pointer hover:gap-3"
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
      console.error('Failed to fetch featured products:', err);
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
      console.error(`Failed to fetch ${category} new arrivals:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* category bar*/}
      <CategoryBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">

        {/* Bento Grid */}
        <BentoBox />

        {/* Featured Section */}
        <Section
          title="Featured Products"
          subtitle="Handpicked items just for you"
          viewAllLink="/browse"
          loading={loading.featured}
        >
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 8).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </Section>

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
  );
};

export default Home;