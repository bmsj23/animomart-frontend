import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, Package } from 'lucide-react';
import { getProducts } from '../api/products';
import { addToFavorites, removeFromFavorites } from '../api/favorites';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BentoBox from '../components/common/Bento';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Books', label: 'Books' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'School Supplies', label: 'School Supplies' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Others', label: 'Others' }
];

const CONDITIONS = [
  { value: "New", label: "Brand New" },
  { value: "Like New", label: "Like New" },
  { value: "Good", label: "Good" },
  { value: "Fair", label: "Fair" }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' }
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [favorites, setFavorites] = useState({});
  const [addedToCart, setAddedToCart] = useState({});

  // filters from url params
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    page: searchParams.get('page') || '1'
  });

  const { addItem, cart } = useCart();
  const { success, error: showError } = useToast();

  // fetch products
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        limit: 12,
        ...(filters.category && { category: filters.category }),
        ...(filters.condition && { condition: filters.condition }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        sort: filters.sort
      };

      const response = await getProducts(params);
      setProducts(response.data.products || []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      console.error('Failed to fetch products:', err);
      showError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // update filters and url params
  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: '1' };
    setFilters(newFilters);

    // update url params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  // add to cart
  const handleAddToCart = async (productId) => {
    try {

      // find the product to get its stock
      const product = products.find(p => p._id === productId);
      if (!product) return;

      // check if product exists in cart and get current quantity
      const cartItem = cart?.items?.find(item => item.product._id === productId);
      const currentQuantityInCart = cartItem ? cartItem.quantity : 0;

      // validate if quantity exceeds stock
      if (currentQuantityInCart >= product.stock) {
        showError(`Cannot add more. Only ${product.stock} in stock.`);
        return;
      }

      if (currentQuantityInCart + 1 > product.stock) {
        showError(`Cannot add more. Only ${product.stock - currentQuantityInCart} remaining.`);
        return;
      }

      await addItem(productId, 1);

      // show success state on button
      setAddedToCart(prev => ({ ...prev, [productId]: true }));

      // reset button state after 2 seconds
      setTimeout(() => {
        setAddedToCart(prev => ({ ...prev, [productId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      showError(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  // toggle favorite
  const handleToggleFavorite = async (productId) => {
    try {
      const isFavorite = favorites[productId];
      if (isFavorite) {
        await removeFromFavorites(productId);
        setFavorites({ ...favorites, [productId]: false });
        success('Removed from favorites');
      } else {
        await addToFavorites({ productId });
        setFavorites({ ...favorites, [productId]: true });
        success('Added to favorites!');
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      showError('Failed to update favorites');
    }
  };

  // format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AnimoMart</h1>
        <p className="text-gray-600">DLSL Campus Marketplace</p>
      </div>

      <BentoBox />

      {/* filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition
            </label>
            <select
              value={filters.condition}
              onChange={(e) => updateFilter('condition', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {CONDITIONS.map(cond => (
                <option key={cond.value} value={cond.value}>{cond.label}</option>
              ))}
            </select>
          </div>

          {/* min price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Price
            </label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => updateFilter('minPrice', e.target.value)}
              placeholder="₱0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* max price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
              placeholder="₱10,000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* clear filters */}
        {(filters.category || filters.condition || filters.minPrice || filters.maxPrice) && (
          <button
            onClick={() => {
              setFilters({ category: '', condition: '', minPrice: '', maxPrice: '', sort: 'newest', page: '1' });
              setSearchParams({});
            }}
            className="mt-4 text-green-600 hover:text-green-700 font-medium text-sm"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* loading state */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner />
        </div>
      )}

      {/* products grid */}
      {!loading && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* product image */}
                <Link to={`/products/${product._id}`} className="block relative aspect-square">
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {/* condition badge */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                      {product.condition}
                    </span>
                  </div>
                  {/* favorite button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleFavorite(product._id);
                    }}
                    className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Heart
                      className={`w-5 h-5 ${favorites[product._id] ? 'text-red-500' : 'text-gray-400'}`}
                      fill={favorites[product._id] ? 'currentColor' : 'none'}
                    />
                  </button>
                </Link>

                {/* product info */}
                <div className="p-4">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-green-600">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                  </p>

                  {/* add to cart button */}
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    disabled={product.stock === 0}
                    className={`w-full py-2 rounded-lg transition-all font-medium ${
                      addedToCart[product._id]
                        ? 'bg-green-700 text-white'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                  >
                    {product.stock === 0
                      ? 'Out of Stock'
                      : addedToCart[product._id]
                        ? 'Added to Cart'
                        : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => updateFilter('page', String(pagination.page - 1))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => updateFilter('page', String(pagination.page + 1))}
                disabled={pagination.page >= pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* empty state */}
      {!loading && products.length === 0 && (
        <div className="text-center py-20">
          <Package className="w-24 h-24 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or check back later</p>
          <button
            onClick={() => {
              setFilters({ category: '', condition: '', minPrice: '', maxPrice: '', sort: 'newest', page: '1' });
              setSearchParams({});
            }}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
