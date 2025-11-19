import { Package, MoreVertical, Trash2, Eye, ExternalLink } from 'lucide-react';

const ProductsTable = ({
  products,
  activeDropdown,
  onToggleDropdown,
  onViewProduct,
  onDeleteProduct,
  onProductClick,
  formatPrice,
  formatDate
}) => {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full">
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
          {products.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                <div className="flex items-center justify-center py-6">
                  <img
                    src="/assets/NoProducts.png"
                    alt="No products"
                    className="w-36 h-36 md:w-44 md:h-44 object-contain mx-auto mb-4"
                  />
                </div>
                No products found
              </td>
            </tr>
          ) : (
            products.map((product, index) => (
              <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => onProductClick(product._id)}
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
                        onClick={() => onProductClick(product._id)}
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
                      onClick={() => onToggleDropdown(product._id)}
                      className="p-1 hover:bg-gray-200 rounded-lg transition-colors hover:cursor-pointer"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                    {activeDropdown === product._id && (
                      <div className={`absolute right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 ${
                        index >= products.length - 3 ? 'bottom-8' : 'top-8 mt-2'
                      }`}>
                        <button
                          onClick={() => onViewProduct(product)}
                          className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700 hover:cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => onDeleteProduct(product)}
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
  );
};

export default ProductsTable;