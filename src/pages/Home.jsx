import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowRight, Sparkles, Clock, Tag, ChevronDown, Menu } from 'lucide-react';
import { getProducts } from '../api/products';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatCurrency';
import BentoBox from '../components/common/Bento';

// category data with subcategories
const categoryData = [
  {
    name: 'School Supplies',
    subcategories: ['Notebooks', 'Pens & Pencils', 'Paper', 'Binders', 'Other Supplies']
  },
  {
    name: 'Electronics',
    subcategories: ['Laptops', 'Phones', 'Accessories', 'Chargers', 'Other Electronics']
  },
  {
    name: 'Books',
    subcategories: ['Textbooks', 'Novels', 'Study Guides', 'Reference', 'Other Books']
  },
  {
    name: 'Clothing',
    subcategories: ['Shirts', 'Pants', 'Shoes', 'Accessories', 'Other Clothing']
  },
  {
    name: 'Food & Beverages',
    subcategories: ['Snacks', 'Drinks', 'Meal Prep', 'Other Food']
  },
  {
    name: 'Sports Equipment',
    subcategories: ['Gym Equipment', 'Sports Gear', 'Outdoor', 'Other Sports']
  },
  {
    name: 'Others',
    subcategories: []
  }
];

// category bar component
const CategoryBar = () => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCategoryClick = (category) => {
    navigate(`/categories?category=${encodeURIComponent(category)}`);
    setMobileMenuOpen(false);
    setHoveredCategory(null);
  };

  return (
    <div className="bg-gray-50 border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* desktop category bar */}
        <div className="hidden md:flex items-center gap-4 py-3">
          <h2 className="font-semibold text-gray-900 text-lg pr-8 whitespace-nowrap">Categories</h2>

          <div className="flex items-center gap-2 flex-1 pl-4 pb-4">
            {categoryData.map((category) => (
              <div
                key={category.name}
                className="relative group"
                onMouseEnter={() => setHoveredCategory(category.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <button
                  onClick={() => handleCategoryClick(category.name)}
                  className="flex items-center gap-1.5 px-6 h-14 bg-gray-100 hover:bg-green-50 hover:text-green-600 rounded-full text-sm font-medium text-gray-700 transition-all whitespace-nowrap border border-transparent hover:border-green-200 hover:cursor-pointer"
                >
                  {category.name}
                  {category.subcategories.length > 0 && (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* dropdown */}
                {category.subcategories.length > 0 && (
                  <div
                    className={`absolute left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-3 min-w-[240px] ${
                      hoveredCategory === category.name ? 'block' : 'hidden'
                    }`}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '0',
                      zIndex: 99999
                    }}
                    onMouseEnter={() => setHoveredCategory(category.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 mb-2">
                      {category.name}
                    </div>
                    <div className="space-y-0.5 px-2">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => handleCategoryClick(sub)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors rounded-lg font-medium"
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
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
              {categoryData.map((category) => (
                <div key={category.name} className="border-b border-gray-100 last:border-0">
                  <button
                    onClick={() => handleCategoryClick(category.name)}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    {category.name}
                  </button>
                  {category.subcategories.length > 0 && (
                    <div className="bg-gray-50 px-4 py-2 space-y-1">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => handleCategoryClick(sub)}
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

// Product Card component
const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addItem, cart } = useCart();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const { error: showError } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isFavorited = favorites?.some(fav => {
    const favProductId = fav._id || fav.product?._id || fav.product;
    return favProductId === product._id;
  });
  const isOwnProduct = product.seller && user?._id &&
    (user._id === product.seller._id || user._id === product.seller);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isAdding || product.stock === 0) return;

    // check stock validation
    const cartItem = cart?.items?.find(item => item.product._id === product._id);
    const currentQuantityInCart = cartItem ? cartItem.quantity : 0;

    if (currentQuantityInCart + 1 > product.stock) {
      showError(`Cannot add more. Only ${product.stock - currentQuantityInCart} remaining.`);
      return;
    }

    try {
      setIsAdding(true);
      await addItem(product._id, 1);
    } catch (error) {
      showError(error.message || 'Failed to add to cart');
    } finally {
      setTimeout(() => setIsAdding(false), 2000);
    }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    try {
      if (isFavorited) {
        await removeFromFavorites(product._id);
      } else {
        await addToFavorites(product._id);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update favorites';
      showError(errorMessage);
    }
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.images?.[0] || '/api/placeholder/400/400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Favorite Button */}
        {!isOwnProduct && (
          <button
            onClick={handleFavorite}
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-2 hover:cursor-pointer rounded-full backdrop-blur-md transition-all duration-300 ${
              isFavorited
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/90 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''} ${justAdded ? 'animate-bounce' : ''}`} />
          </button>
        )}

        {/* Stock Badge */}
        {product.stock === 0 && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-1 bg-gray-900/90 backdrop-blur-md rounded-lg text-xs font-medium text-white">
            Out of stock
          </div>
        )}

        {/* Own Product Badge */}
        {isOwnProduct && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-3 py-1.5 bg-green-600/90 backdrop-blur-md rounded-lg text-xs font-medium text-white">
            Your Listing
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 md:p-4 bg-gray-50">
        <h3 className="font-medium text-gray-900 text-sm md:text-base mb-1.5 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-2">
          <span className="text-lg md:text-xl font-bold text-gray-900">
            {formatCurrency(product.price)}
          </span>

          {!isOwnProduct && (
            <button
              onClick={handleAddToCart}
              disabled={isAdding || product.stock === 0}
              className={`p-2 hover:cursor-pointer rounded-lg transition-all duration-300 text-sm md:text-base ${
                isAdding
                  ? 'bg-green-600 text-white'
                  : product.stock === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isAdding ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

// Section component
const Section = ({ title, subtitle, icon: Icon, viewAllLink, children, loading }) => {
  const navigate = useNavigate();

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-green-600 rounded-lg">
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {viewAllLink && !loading && (
          <button
            onClick={() => navigate(viewAllLink)}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:gap-3 transition-all font-medium text-sm md:text-base hover:cursor-pointer"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse" />
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
          icon={Sparkles}
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
          icon={Tag}
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
          icon={Clock}
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
          icon={Clock}
          viewAllLink="/browse?category=Books&sort=newest"
          loading={loading.books}
        >
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {newArrivalsBooks.slice(0, 8).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </Section>

        {/* browse all cta */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 md:p-12 text-white text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Want to See More?
          </h3>
          <p className="text-green-50 mb-6 text-lg max-w-2xl mx-auto">
            Browse our complete collection of products with advanced filters
          </p>
          <button
            onClick={() => navigate('/browse')}
            className="inline-flex items-center gap-2 bg-white text-green-700 px-8 py-4 rounded-lg font-medium text-lg hover:bg-green-50 transition-colors hover:cursor-pointer"
          >
            Browse All Products
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Home;