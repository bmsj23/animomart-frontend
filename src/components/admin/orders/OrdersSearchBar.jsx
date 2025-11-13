import { Search } from 'lucide-react';

const OrdersSearchBar = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search orders by ID, buyer, or seller..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
        />
      </div>
    </div>
  );
};

export default OrdersSearchBar;