import { Package, MoreVertical, Trash2, Eye } from 'lucide-react';

const ProductsMobileCard = ({
  product,
  activeDropdown,
  onToggleDropdown,
  onViewProduct,
  onDeleteProduct,
  onProductClick,
  formatPrice,
  formatDate
}) => {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div
          onClick={() => onProductClick(product._id)}
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
            onClick={() => onProductClick(product._id)}
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
          onClick={() => onToggleDropdown(product._id)}
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
            onClick={() => onViewProduct(product)}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-lg transition-colors hover:cursor-pointer flex items-center gap-2"
          >
            <Eye className="w-4 h-4" /> View Details
          </button>
          <button
            onClick={() => onDeleteProduct(product)}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors hover:cursor-pointer flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete Product
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsMobileCard;