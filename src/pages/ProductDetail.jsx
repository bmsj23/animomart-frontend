import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, getSimilarProducts, incrementProductView } from '../api/products';
import { checkWishlist } from '../api/wishlist';
import { addToCart } from '../api/cart';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ReviewList from '../components/common/ReviewList';
import ProductGallery from '../components/product-detail/ProductGallery';
import ProductInfo from '../components/product-detail/ProductInfo';
import ProductActions from '../components/product-detail/ProductActions';
import SellerInfo from '../components/product-detail/SellerInfo';
import SuccessPopup from '../components/product-detail/SuccessPopup';
import WishlistPopup from '../components/product-detail/WishlistPopup';
import SimilarProducts from '../components/product-detail/SimilarProducts';
import ReportModal from '../components/common/ReportModal';
import DeliveryOptions from '../components/product-detail/DeliveryOptions';
import { logger } from '../utils/logger';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchCart, cart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlist } = useWishlist();
  const { error: showError } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const addedTimeoutRef = useRef(null);
  const viewTrackedRef = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchProduct();
    fetchSimilarProducts();
    // reset optimistic add state when navigating to a new product
    setAddedToCart(false);
    setIsAdding(false);
    viewTrackedRef.current = false;
    // update favorite state based on wishlist
    setIsFavorite(Boolean(isInWishlist(id)));
    if (addedTimeoutRef.current) {
      clearTimeout(addedTimeoutRef.current);
      addedTimeoutRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ensure heart reflects server state on refresh (in case wishlist wasn't loaded yet)
  useEffect(() => {
    let mounted = true;
    const verifyWishlist = async () => {
      if (!user || !id) return;
      try {
        // if context already knows, prefer that
        if (isInWishlist(id)) {
          if (mounted) setIsFavorite(true);
          return;
        }

        const res = await checkWishlist(id);
        // normalize response: backend may return a boolean or an object { inWishlist: boolean }
        let inList = false;
        if (typeof res === 'boolean') {
          inList = res;
        } else if (typeof res?.inWishlist === 'boolean') {
          inList = res.inWishlist;
        } else if (typeof res?.data?.inWishlist === 'boolean') {
          inList = res.data.inWishlist;
        } else if (Array.isArray(res?.products)) {
          // some APIs return a products array when checking; consider product present if array contains it
          inList = res.products.some(p => (p._id || p.id) === id);
        }
        if (mounted) setIsFavorite(Boolean(inList));
      } catch (err) {
          logger.error('failed to verify wishlist status:', err);
      }
    };

    verifyWishlist();
    return () => { mounted = false; };
  }, [id, user, isInWishlist]);

  // keep isFavorite in sync when wishlist changes
  useEffect(() => {
    if (!product) return;
    setIsFavorite(Boolean(isInWishlist(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlist, id]);

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

      if (!viewTrackedRef.current) {
        viewTrackedRef.current = true;
        incrementProductView(id);
      }
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

      // only update UI after backend confirms success (non-optimistic)
      setAddedToCart(true);
      setShowSuccessPopup(true);

      // show 'Added to Cart' for 1.5 seconds, then reset
      if (addedTimeoutRef.current) {
        clearTimeout(addedTimeoutRef.current);
      }
      addedTimeoutRef.current = setTimeout(() => {
        setAddedToCart(false);
        addedTimeoutRef.current = null;
      }, 2000);
    } catch (err) {
      logger.error('Failed to add to cart:', err);
      setAddedToCart(false);
      showError(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      if (isFavorite) {
        await removeFromWishlist(id);
        setIsFavorite(false);
      } else {
        // provide product object for optimistic update (matches Bento behavior)
        await addToWishlist(id, product);
        setIsFavorite(true);

        // show "Added!" feedback both as a small animation and a modal
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);

        setShowWishlistPopup(true);
      }
    } catch (err) {
      logger.error('failed to toggle wishlist:', err);
      showError('failed to update wishlist');
    } finally {
      setIsProcessing(false);
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
      <SuccessPopup
        show={showSuccessPopup}
        quantity={quantity}
        product={product}
        onClose={() => setShowSuccessPopup(false)}
      />
      <WishlistPopup
        show={showWishlistPopup}
        onClose={() => setShowWishlistPopup(false)}
      />

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
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          <ProductInfo
            product={product}
            formatPrice={formatPrice}
            formatCondition={formatCondition}
            formatCategory={formatCategory}
            isOutOfStock={isOutOfStock}
          />

          <ProductActions
            isOwnProduct={isOwnProduct}
            isOutOfStock={isOutOfStock}
            quantity={quantity}
            maxStock={product.stock}
            isFavorite={isFavorite}
            isAdding={isAdding}
            addedToCart={addedToCart}
            isProcessing={isProcessing}
            justAdded={justAdded}
            onQuantityChange={setQuantity}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
          />

          <SellerInfo seller={product.seller} productId={id} isOwnProduct={isOwnProduct} />

          {!isOwnProduct && user && (
            <div className="mt-4">
              <button
                onClick={() => setShowReportModal(true)}
                className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Report this product
              </button>
            </div>
          )}
        </div>
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        entityType="product"
        entityId={id}
        entityName={product.name}
      />

      {/* reviews section */}
      <div className="mt-12 border-t border-gray-200 pt-12">
        <h2 className="text-2xl font-serif font-light text-gray-900 mb-6">Customer Reviews</h2>
        <ReviewList
          productId={id}
          canRespond={user?._id === product.seller?._id}
          sellerId={product.seller?._id}
        />
      </div>

      <SimilarProducts products={similarProducts} loading={loadingSimilar} />
    </div>
  );
};

export default ProductDetail;