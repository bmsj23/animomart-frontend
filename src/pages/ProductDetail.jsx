import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProduct } from '../api/products';
import { addToCart } from '../api/cart';
import { addToFavorites, removeFromFavorites } from '../api/favorites';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const { success, error: showError } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      console.log('Fetching product with ID:', id);
      const response = await getProduct(id);
      console.log('Product response:', response);
      setProduct(response.data);
    } catch (err) {
      console.error('Failed to fetch product:', err);
      console.error('Error response:', err.response?.data);
      showError(err.response?.data?.message || 'Failed to load product');
      // don't redirect immediately, let user see the error
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart({ productId: id, quantity });
      await refreshCart();
      success('Added to cart!');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      showError(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFromFavorites(id);
        setIsFavorite(false);
        success('Removed from favorites');
      } else {
        await addToFavorites({ productId: id });
        setIsFavorite(true);
        success('Added to favorites!');
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      showError('Failed to update favorites');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* breadcrumb */}
      <div className="mb-6">
        <nav className="flex text-sm text-gray-500">
          <Link to="/" className="hover:text-green-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to={`/?category=${product.category?.toLowerCase()}`} className="hover:text-green-600">
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
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg text-center"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50"
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
                  disabled={isOutOfStock}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className="w-12 h-12 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                >
                  <svg
                    className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                    fill={isFavorite ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
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
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
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
                  to={`/messages?user=${product.seller?._id}`}
                  className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
                >
                  Contact Seller
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* related products or reviews section can go here */}
    </div>
  );
};

export default ProductDetail;
