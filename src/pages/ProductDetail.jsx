import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, CheckCircle, ShoppingCart } from 'lucide-react';
import { getProduct, getSimilarProducts } from '../api/products';
import { addToCart } from '../api/cart';
import { /* addToWishlist, removeFromWishlist */ } from '../api/wishlist';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProductCard from '../components/common/ProductCard';
import { logger } from '../utils/logger';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchCart, cart } = useCart();
  const { addToWishlist, removeFromWishlist } = useWishlist();
  const { error: showError } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const addedTimeoutRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchProduct();
    fetchSimilarProducts();
    // reset optimistic add state when navigating to a new product
    setAddedToCart(false);
    setIsAdding(false);
    if (addedTimeoutRef.current) {
      clearTimeout(addedTimeoutRef.current);
      addedTimeoutRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // clear timeout on unmount
  useEffect(() => {
    return () => {
      if (addedTimeoutRef.current) {
        clearTimeout(addedTimeoutRef.current);
        addedTimeoutRef.current = null;
      }
    };
  }, []);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      logger.log('Fetching product with ID:', id);
      const response = await getProduct(id);
      logger.log('Product response:', response);
      setProduct(response.data);
    } catch (err) {
      logger.error('Failed to fetch product:', err);
      logger.error('Error response:', err.response?.data);
      showError(err.response?.data?.message || 'Failed to load product');
      // don't redirect immediately, let user see the error
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      setLoadingSimilar(true);
      const response = await getSimilarProducts(id, { limit: 6 });
      if (response.success && response.data) {
        setSimilarProducts(response.data);
      }
    } catch (err) {
      logger.warn('failed to fetch similar products:', err);
      // we will not show error to user. just skip the section
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleAddToCart = async () => {
    if (isAdding || addedToCart) return;

    // check current quantity in cart
    const cartItem = cart?.items?.find(item => item.product?._id === id);
    const currentCartQuantity = cartItem?.quantity || 0;
    const totalQuantity = currentCartQuantity + quantity;

    // validate against available stock
    if (totalQuantity > product.stock) {
      const remaining = product.stock - currentCartQuantity;
      if (remaining <= 0) {
        showError(`This Product is already in your Cart with Maximum Available Stock (${product.stock})`);
      } else {
        showError(`Only ${remaining} more can be added. You already have ${currentCartQuantity} in your cart`);
      }
      return;
    }

    setIsAdding(true);
    if (addedTimeoutRef.current) {
      clearTimeout(addedTimeoutRef.current);
      addedTimeoutRef.current = null;
    }

    try {
      await addToCart({ productId: id, quantity });
      await fetchCart();

      setAddedToCart(true);
      setShowSuccessPopup(true);
    } catch (err) {
      logger.error('Failed to add to cart:', err);
      setAddedToCart(false);
      showError(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFromWishlist(id);
        setIsFavorite(false);
      } else {
        // pass the product object for an optimistic UI update
        await addToWishlist(id, product);
        setIsFavorite(true);
      }
    } catch (err) {
      logger.error('failed to toggle wishlist:', err);
      showError('failed to update wishlist');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const formatCondition = (condition) => {
    return condition
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatCategory = (category) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
        <button
          onClick={() => navigate('/')}
          className="text-green-600 hover:text-green-700 font-medium"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const isOwnProduct = user?._id === product.seller?._id;
  const isOutOfStock = product.stock === 0;

  // compute Add to Cart button classes so disabled state can differ
  const getAddToCartClass = () => {
    if (isOutOfStock) {
      // out of stock should remain visually disabled (gray)
      return 'flex-1 bg-gray-300 text-white py-3 rounded-lg cursor-not-allowed font-medium';
    }
    if (addedToCart) {
      // when already added, keep it disabled but use a darker green background
      return 'flex-1 bg-green-800 text-white py-3 rounded-lg cursor-not-allowed font-medium';
    }
    // default active state (clickable -> show pointer on hover)
    return 'flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 hover:cursor-pointer transition-colors font-medium';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* success popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform animate-scaleIn">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounceIn">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Added To Cart!
              </h3>
              <p className="text-gray-600 mb-6">
                {quantity} {quantity > 1 ? 'items' : 'item'} successfully added to your cart
              </p>
              <div className="flex flex-col gap-3 w-full">
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => navigate('/cart')}
                    className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-700 hover:cursor-pointer font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    View Cart
                  </button>
                  <button
                    onClick={() => navigate('/checkout', {
                      state: {
                        directCheckout: true,
                        product: product,
                        quantity: quantity
                      }
                    })}
                    className="flex-1 px-6 py-3 bg-[rgb(var(--color-primary-dark))] text-white rounded-lg hover:bg-[rgb(var(--color-primary))] hover:cursor-pointer font-medium transition-colors"
                  >
                    Checkout
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowSuccessPopup(false);
                    setAddedToCart(false);
                  }}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-300 hover:cursor-pointer font-medium transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* breadcrumb */}
      <div className="mb-6">
        <nav className="flex text-sm text-gray-500">
          <Link to="/" className="hover:text-green-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/browse" className="hover:text-green-600">Browse</Link>
          <span className="mx-2">/</span>
          <Link to={`/browse?category=${encodeURIComponent(product.category)}`} className="hover:text-green-600">
            {formatCategory(product.category)}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* image gallery */}
        <div>
          {/* main image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={product.images?.[selectedImage] || 'https://via.placeholder.com/600'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* thumbnail images */}
          {product.images?.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-green-600' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* product info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          {/* price */}
          <div className="mb-6">
            <p className="text-4xl font-bold text-green-600">{formatPrice(product.price)}</p>
          </div>

          {/* badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {formatCondition(product.condition)}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {formatCategory(product.category)}
            </span>
            {isOutOfStock && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                Out of Stock
              </span>
            )}
          </div>

          {/* stock */}
          <div className="mb-6">
            <p className="text-gray-700">
              <span className="font-medium">Stock:</span> {product.stock} available
            </p>
          </div>

          {/* description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
          </div>

          {/* meetup locations */}
          {product.meetupLocations?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Meetup Locations</h2>
              <div className="flex flex-wrap gap-2">
                {product.meetupLocations.map((location, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                    {location}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* quantity selector (if not own product) */}
          {!isOwnProduct && !isOutOfStock && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 hover:cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 hover:cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* action buttons */}
          <div className="flex gap-3 mb-6">
            {!isOwnProduct && (
              <>
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdding || addedToCart}
                  className={getAddToCartClass()}
                >
                  {isOutOfStock ? 'Out of Stock' : (addedToCart ? 'Added to Cart' : 'Add to Cart')}
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className="w-12 h-12 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                >
                  <Heart
                    className={`w-6 h-6 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
                    fill={isFavorite ? 'currentColor' : 'none'}
                  />
                </button>
              </>
            )}
            {isOwnProduct && (
              <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-800 font-medium">This is your listing</p>
              </div>
            )}
          </div>

          {/* seller info */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h2>
            <div className="flex items-center gap-4">
              {product.seller?.profilePicture ? (
                <img
                  src={product.seller.profilePicture}
                  alt={product.seller.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold"
                style={{ display: product.seller?.profilePicture ? 'none' : 'flex' }}
              >
                {product.seller?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{product.seller?.name}</p>
                {product.seller?.businessName && (
                  <p className="text-sm text-gray-600">{product.seller?.businessName}</p>
                )}
              </div>
              {!isOwnProduct && (
                <Link
                  to={`/messages?user=${product.seller?._id}&product=${product._id}`}
                  className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
                >
                  Contact Seller
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* you may also like section */}
      {similarProducts.length > 0 && (
        <div className="mt-12 border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-serif font-light text-gray-900 mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {similarProducts.map((similarProduct) => (
              <ProductCard key={similarProduct._id} product={similarProduct} />
            ))}
          </div>
        </div>
      )}

      {loadingSimilar && !similarProducts.length && (
        <div className="mt-12 border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-serif font-light text-gray-900 mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;