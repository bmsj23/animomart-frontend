import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowRight, Sparkles, Clock, Tag } from 'lucide-react';
import { getProducts } from '../api/products';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatCurrency';
import BentoBox from '../components/common/Bento';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

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