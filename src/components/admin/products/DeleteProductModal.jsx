import { Trash2 } from 'lucide-react';
import Modal from '../../common/Modal';

const DeleteProductModal = ({ isOpen, product, onClose, onConfirmDelete }) => {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Product">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
          <Trash2 className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-gray-700">
            Are you sure you want to delete <span className="font-semibold">{product.name}</span>? This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmDelete(product._id)}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors hover:cursor-pointer"
          >
            Delete Product
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteProductModal;