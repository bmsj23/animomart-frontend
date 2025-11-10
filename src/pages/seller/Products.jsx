import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Pause, Play, Package, Eye } from 'lucide-react';
import { getMyListings, updateProductStatus, deleteProduct } from '../../api/products';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatCurrency';
import { getParentCategory } from '../../constants/categories';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const { success, error } = useToast();

  const currentPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await getMyListings(params);
      const data = response.data || response;

      setProducts(data.products || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error('failed to fetch products:', err);
      error('Failed To Load Products');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await updateProductStatus(productId, newStatus);
      success(`Product ${newStatus === 'active' ? 'Activated' : 'Paused'}`);
      fetchProducts();
    } catch (err) {
      console.error('failed to update status:', err);
      error('Failed To Update Product Status');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;

    try {
      await deleteProduct(deleteModal.product._id);
      success('Product Deleted Successfully');
      setDeleteModal({ isOpen: false, product: null });
      fetchProducts();
    } catch (err) {
      console.error('failed to delete product:', err);
      error('Failed To Delete Product');
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage, ...(statusFilter !== 'all' && { status: statusFilter }) });
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setSearchParams({ page: 1, ...(status !== 'all' && { status }) });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Out Of Stock</span>;
    } else if (stock <= 5) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">Low Stock ({stock})</span>;
    }
    return <span className="text-sm text-gray-600">{stock}</span>;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-gray-100 text-gray-800',
      deleted: 'bg-red-100 text-red-800'
    };
    const labels = {
      active: 'Active',
      paused: 'Paused',
      sold: 'Sold',
      deleted: 'Deleted'
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status]}`}>{labels[status]}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <p className="mt-1 text-sm text-gray-600">Manage Your Product Listings</p>
        </div>
        <Link
          to="/seller/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors hover:cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* status filter */}
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'active', 'paused', 'sold'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors hover:cursor-pointer ${
                  statusFilter === status
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* products list */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'Try adjusting your Search' : 'Start by listing your first product'}
          </p>
          {!searchQuery && (
            <Link
              to="/seller/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors hover:cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>List Product</span>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {product.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getParentCategory(product.category)}</div>
                        <div className="text-xs text-gray-500">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStockBadge(product.stock)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Eye className="w-4 h-4" />
                          {product.views || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/seller/products/${product._id}/edit`}
                            className="text-blue-600 hover:text-blue-900 hover:cursor-pointer"
                            title="edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>

                          {product.status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(product._id, 'paused')}
                              className="text-orange-600 hover:text-orange-900 hover:cursor-pointer"
                              title="pause"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          )}

                          {product.status === 'paused' && (
                            <button
                              onClick={() => handleStatusChange(product._id, 'active')}
                              className="text-green-600 hover:text-green-900 hover:cursor-pointer"
                              title="activate"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setDeleteModal({ isOpen: true, product })}
                            className="text-red-600 hover:text-red-900 hover:cursor-pointer"
                            title="delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing Page {pagination.currentPage} of {pagination.totalPages}
                {' '}({pagination.totalProducts} Total Products)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* delete confirmation modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        title="Delete Product"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <strong>{deleteModal.product?.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setDeleteModal({ isOpen: false, product: null })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 hover:cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;