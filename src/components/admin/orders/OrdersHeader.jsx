import { ShoppingCart } from 'lucide-react';

const OrdersHeader = ({ orderCount }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600 mt-1">Track and manage marketplace transactions</p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-amber-500 to-amber-600 text-white rounded-2xl">
        <ShoppingCart className="w-5 h-5" />
        <span className="font-semibold">{orderCount} Orders</span>
      </div>
    </div>
  );
};

export default OrdersHeader;