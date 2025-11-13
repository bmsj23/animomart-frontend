import { Package, ExternalLink } from 'lucide-react';
import Modal from '../../common/Modal';

const ProductDetailsModal = ({ product, onClose, onProductClick, formatPrice, formatDate }) => {
  if (!product) return null;

  return (
    <Modal isOpen={!!product} onClose={onClose} title="Product Details">
      <div className="space-y-4">
        <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
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
            <p className="font-semibold text-gray-900">{product.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Description</p>
            <p className="text-gray-900">{product.description || 'No description'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Price</p>
              <p className="font-semibold text-gray-900">{formatPrice(product.price)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="font-semibold text-gray-900">{product.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold text-gray-900">{product.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Seller</p>
              <p className="font-semibold text-gray-900">{product.seller?.name || 'Unknown'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Created At</p>
            <p className="text-gray-900">{formatDate(product.createdAt)}</p>
          </div>
          <div className="pt-3 border-t">
            <button
              onClick={() => onProductClick(product._id)}
              className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 hover:cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductDetailsModal;