import { useState, useEffect } from 'react';
import { getAllProducts, adminDeleteProduct } from '../../api/admin';
import { useToast } from '../../hooks/useToast';
import { Search, Package, MoreVertical, Trash2, Eye, User, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionModal, setActionModal] = useState({ show: false, type: '', product: null });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // fetch all products by passing a large limit
      const response = await getAllProducts({ limit: 1000 });
      console.log('products response:', response);

      const productsData = response.products || response.data?.products || response?.data || [];
      console.log('extracted products:', productsData);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      showError('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await adminDeleteProduct(productId);
      showSuccess('product deleted successfully');
      fetchProducts();
      setActionModal({ show: false, type: '', product: null });
    } catch (error) {
      showError('failed to delete product');
      console.error('error deleting product:', error);
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // pagination calculations
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (productId) => {
    window.open(`/products/${productId}`, '_blank');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage marketplace listings</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-2xl">
          <Package className="w-5 h-5" />
          <span className="font-semibold">{products.length} Products</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* search bar */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, seller, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* mobile card view */}
        <div className="md:hidden divide-y divide-gray-200">
          {currentProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No products found</div>
          ) : (
            currentProducts.map((product) => (
              <div key={product._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    onClick={() => handleProductClick(product._id)}
                    className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 hover:cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                  >
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      onClick={() => handleProductClick(product._id)}
                      className="font-medium text-gray-900 truncate hover:text-purple-600 hover:cursor-pointer transition-colors"
                    >{product.name}</p>
                    <p className="text-sm text-gray-600">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800">{product.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-lg ${
                        product.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>{product.status}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === product._id ? null : product._id)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors hover:cursor-pointer"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">Seller: {product.seller?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500">Created: {formatDate(product.createdAt)}</p>

                {activeDropdown === product._id && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                    <button
                      onClick={() => { handleViewProduct(product); setActiveDropdown(null); }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-lg transition-colors hover:cursor-pointer flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </button>
                    <button
                      onClick={() => { setActionModal({ show: true, type: 'delete', product }); setActiveDropdown(null); }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors hover:cursor-pointer flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Product
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* desktop table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            {/* table header */}
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                currentProducts.map((product, index) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => handleProductClick(product._id)}
                          className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 hover:cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                        >
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            onClick={() => handleProductClick(product._id)}
                            className="font-medium text-gray-900 truncate hover:text-purple-600 hover:cursor-pointer transition-colors flex items-center gap-1"
                          >
                            {product.name}
                            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </p>
                          <p className="text-sm text-gray-500 truncate">ID: {product._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900">{product.seller?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{formatPrice(product.price)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-800">
                          {product.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          product.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'sold'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">{formatDate(product.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-9 py-4">
                      <div className="flex justify-end relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === product._id ? null : product._id)}
                          className="p-1 hover:bg-gray-200 rounded-lg transition-colors hover:cursor-pointer"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        {activeDropdown === product._id && (
                          <div className={`absolute right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 ${
                            index >= currentProducts.length - 3 ? 'bottom-8' : 'top-8 mt-2'
                          }`}>
                            <button
                              onClick={() => {
                                handleViewProduct(product);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700 hover:cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                setActionModal({ show: true, type: 'delete', product });
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-red-50 text-red-600 hover:cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Product
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* pagination controls */}
        {filteredProducts.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // show first page, last page, current page, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:cursor-pointer ${
                            currentPage === pageNumber
                              ? 'bg-purple-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                      return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:cursor-pointer'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {actionModal.show && actionModal.type === 'delete' && (
        <Modal
          isOpen={actionModal.show}
          onClose={() => setActionModal({ show: false, type: '', product: null })}
          title="Delete Product"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
              <Trash2 className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold">{actionModal.product?.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActionModal({ show: false, type: '', product: null })}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(actionModal.product._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors hover:cursor-pointer"
              >
                Delete Product
              </button>
            </div>
          </div>
        </Modal>
      )}

      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title="Product Details"
        >
          <div className="space-y-4">
            <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Product Name</p>
                <p className="font-semibold text-gray-900">{selectedProduct.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-900">{selectedProduct.description || 'No description'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-semibold text-gray-900">{formatPrice(selectedProduct.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Seller</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.seller?.name || 'Unknown'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="text-gray-900">{formatDate(selectedProduct.createdAt)}</p>
              </div>
              <div className="pt-3 border-t">
                <button
                  onClick={() => handleProductClick(selectedProduct._id)}
                  className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 hover:cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Products;