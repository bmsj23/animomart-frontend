import { useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { ShoppingCart } from 'lucide-react';

const Cart = () => {
  const { cart, fetchCart, loading } = useCart();

  useEffect(() => {
    if (!cart) fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasItems = cart && Array.isArray(cart.items) && cart.items.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      {/* Minimalist table header (pill-shaped) - only show when there are items */}
      {hasItems ? (
        <div className="mb-6">
          <div className="bg-gray-50 rounded-2xl px-4 h-14 shadow-sm border border-gray-100">
            <div className="flex items-center h-full text-gray-700 font-medium text-md">
              {/* Column 1: Product (label only) */}
              <div className="flex items-center justify-start flex-[2] min-w-0 pl-6 md:pl-8 h-full">
                <span className="truncate text-left flex items-center h-full">Product</span>
              </div>

              {/* Column 2: Unit Price */}
              <div className="flex-1 text-right">
                <span className="flex items-center h-full justify-end">Unit Price</span>
              </div>

              {/* Column 3: Quantity */}
              <div className="flex-1 text-right">
                <span className="flex items-center h-full justify-end">Quantity</span>
              </div>

              {/* Column 4: Total Price */}
              <div className="flex-1 text-right">
                <span className="flex items-center h-full justify-end">Total Price</span>
              </div>

              {/* Column 5: Actions (match Product padding) */}
              <div className="flex-1 text-right pr-6 md:pr-8">
                <span className="flex items-center h-full justify-end">Actions</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // show only empty message when no items
        <div className="py-12 flex flex-col items-center justify-center gap-4 text-gray-600">
          <ShoppingCart className="w-16 h-16 text-gray-400" />
          <div className="text-2xl font-medium text-gray-700">Your cart is empty.</div>
        </div>
      )}

      {/* Cart items will be displayed below */}
    </div>
  );
};

export default Cart;
