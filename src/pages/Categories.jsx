import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/products';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatCurrency';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Categories = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { success: showSuccess } = useToast();

  const categories = [
    'All',
    'School Supplies',
    'Electronics',
    'Books',
    'Clothing',
    'Food & Beverages',
    'Handmade Items',
    'Sports Equipment',
    'Dorm Essentials',
    'Beauty & Personal Care',
    'Others',
  ];

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addingToCart, setAddingToCart] = useState({});
  const productsPerPage = 16;

  // fetch products based on selected category and page
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: productsPerPage,
        };

        // only add category filter if not 'All'
        if (selectedCategory !== 'All') {
          params.category = selectedCategory;
        }

        const response = await getProducts(params);
        setProducts(response.data.products || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, currentPage]);

  // update url params when category changes
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const handleAddToCart = async (product) => {
    setAddingToCart(prev => ({ ...prev, [product._id]: true }));
    try {
      await addItem(product._id, 1);
      showSuccess('Added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const handleFavorite = async (product) => {
    const isFavorited = favorites.some(fav => fav._id === product._id);
    try {
      if (isFavorited) {
        await removeFavorite(product._id);
      } else {
        await addFavorite(product._id);
      }
    } catch (error) {
      console.error('Failed to update favorites:', error);
    }
  };

  const isOwnProduct = (product) => {
    return product.seller && user?._id &&
      (user._id === product.seller._id || user._id === product.seller);
  };

  const isFavorited = (product) => {
    return favorites.some(fav => fav._id === product._id);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse by Category</h1>
          <p className="text-gray-600 mt-2">Explore products across different categories</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* sidebar - categories */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
              <nav className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedCategory === category
                        ? 'bg-green-600 text-white font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* main content - products */}
          <main className="flex-1 min-w-0">
            {/* category title and count */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === 'All' ? 'All Products' : selectedCategory}
              </h2>
              {!loading && (
                <p className="text-gray-600 mt-1">
                  {products.length} {products.length === 1 ? 'product' : 'products'} found
                </p>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No products found in this category</p>
              </div>
            ) : (
              <>
                {/* products grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => {
                    const isOwn = isOwnProduct(product);
                    const isFav = isFavorited(product);

                    return (
                      <div
                        key={product._id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                      >
                        {/* product image */}
                        <div
                          className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
                          onClick={() => navigate(`/products/${product._id}`)}
                        >
                          <img
                            src={product.images?.[0] || 'https://via.placeholder.com/400'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* badges */}
                          {isOwn && (
                            <div className="absolute top-3 left-3 px-3 py-1.5 bg-green-600/90 backdrop-blur-md rounded-lg text-xs font-medium text-white">
                              Your Listing
                            </div>
                          )}
                          {product.stock === 0 && (
                            <div className="absolute top-3 right-3 px-3 py-1.5 bg-gray-900/90 backdrop-blur-md rounded-lg text-xs font-medium text-white">
                              Out of Stock
                            </div>
                          )}
                        </div>

                        {/* product info */}
                        <div className="p-4">
                          <div
                            className="cursor-pointer"
                            onClick={() => navigate(`/products/${product._id}`)}
                          >
                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-green-600 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">{product.condition}</p>
                            <p className="text-xl font-bold text-green-600 mb-3">
                              {formatCurrency(product.price)}
                            </p>
                          </div>

                          {/* action buttons */}
                          {!isOwn && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleFavorite(product)}
                                className={`flex-shrink-0 p-2.5 rounded-lg border transition-all ${
                                  isFav
                                    ? 'bg-red-50 border-red-200 text-red-600'
                                    : 'bg-white border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600'
                                }`}
                              >
                                <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={product.stock === 0 || addingToCart[product._id]}
                                className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                {addingToCart[product._id] ? (
                                  'Adding...'
                                ) : (
                                  <>
                                    <ShoppingCart className="w-4 h-4" />
                                    Add to Cart
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${
                            currentPage === page
                              ? 'bg-green-600 text-white shadow-sm'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Categories;