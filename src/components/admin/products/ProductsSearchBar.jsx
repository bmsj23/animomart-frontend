import { Search } from 'lucide-react';

const ProductsSearchBar = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="p-4 sm:p-6 border-b border-gray-200">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search products by name, seller, or category..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      </div>
    </div>
  );
};

export default ProductsSearchBar;