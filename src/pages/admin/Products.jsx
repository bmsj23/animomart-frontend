import { useState, useEffect } from 'react';
import { getAllProducts, adminDeleteProduct } from '../../api/admin';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductsHeader from '../../components/admin/products/ProductsHeader';
import ProductsSearchBar from '../../components/admin/products/ProductsSearchBar';
import ProductsMobileCard from '../../components/admin/products/ProductsMobileCard';
import ProductsTable from '../../components/admin/products/ProductsTable';
import ProductDetailsModal from '../../components/admin/products/ProductDetailsModal';
import DeleteProductModal from '../../components/admin/products/DeleteProductModal';
import ProductsPagination from '../../components/admin/products/ProductsPagination';
import { logger } from '../../utils/logger';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // fetch all products by passing a large limit
      const response = await getAllProducts({ limit: 1000 });
      logger.log('products response:', response);

      const productsData = response.products || response.data?.products || response?.data || [];
      logger.log('extracted products:', productsData);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      showError('Failed to fetch products');
      logger.error('Error fetching products:', error);
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
      logger.error('error deleting product:', error);
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setActiveDropdown(null);
  };

  const handleToggleDropdown = (productId) => {
    setActiveDropdown(activeDropdown === productId ? null : productId);
  };

  const handleOpenDeleteModal = (product) => {
    setActionModal({ show: true, type: 'delete', product });
    setActiveDropdown(null);
  };

  const handleCloseDeleteModal = () => {
    setActionModal({ show: false, type: '', product: null });
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

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
      <ProductsHeader totalProducts={products.length} />

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <ProductsSearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <div className="md:hidden divide-y divide-gray-200">
          {currentProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="flex items-center justify-center py-6">
                <img
                  src="/assets/NoProducts.png"
                  alt="No products"
                  className="w-40 h-40 md:w-48 md:h-48 object-contain mx-auto mb-4"
                />
              </div>
              <div>No products found</div>
            </div>
          ) : (
            currentProducts.map((product) => (
              <ProductsMobileCard
                key={product._id}
                product={product}
                activeDropdown={activeDropdown}
                onToggleDropdown={handleToggleDropdown}
                onViewProduct={handleViewProduct}
                onDeleteProduct={handleOpenDeleteModal}
                onProductClick={handleProductClick}
                formatPrice={formatPrice}
                formatDate={formatDate}
              />
            ))
          )}
        </div>

        <ProductsTable
          products={currentProducts}
          activeDropdown={activeDropdown}
          onToggleDropdown={handleToggleDropdown}
          onViewProduct={handleViewProduct}
          onDeleteProduct={handleOpenDeleteModal}
          onProductClick={handleProductClick}
          formatPrice={formatPrice}
          formatDate={formatDate}
        />

        <ProductsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          indexOfFirstProduct={indexOfFirstProduct}
          indexOfLastProduct={indexOfLastProduct}
          filteredProductsLength={filteredProducts.length}
          onPageChange={handlePageChange}
        />
      </div>

      <DeleteProductModal
        isOpen={actionModal.show && actionModal.type === 'delete'}
        product={actionModal.product}
        onClose={handleCloseDeleteModal}
        onConfirmDelete={handleDeleteProduct}
      />

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onProductClick={handleProductClick}
        formatPrice={formatPrice}
        formatDate={formatDate}
      />
    </div>
  );
};

export default Products;