import { Package } from 'lucide-react';

const ProductsHeader = ({ totalProducts }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Management</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage marketplace listings</p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-2xl">
        <Package className="w-5 h-5" />
        <span className="font-semibold">{totalProducts} Products</span>
      </div>
    </div>
  );
};

export default ProductsHeader;