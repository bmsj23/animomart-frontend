import { Link } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import { formatCurrency } from "../../utils/formatCurrency";

const SalesTab = ({ sales, loading, error }) => {
  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (sales.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-700 mb-4">You haven't made any sales yet.</p>
        <Link to="/profile?tab=listings" className="px-4 py-2 bg-green-600 text-white rounded-md">View my listings</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sales.map((entry, idx) => (
        <div key={entry.orderId + '-' + idx} className="bg-white border border-gray-100 rounded-lg p-4 flex items-center gap-4">
          <div className="w-32 shrink-0">
            <img src={entry.product?.image || entry.product?.images?.[0] || '/api/placeholder/400/320'} alt={entry.product?.name || 'Product'} className="w-full h-24 object-cover rounded" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{entry.product?.name || 'Product'}</h3>
            <p className="text-sm text-gray-600">Buyer: {entry.buyer?.name || entry.buyer?.email || entry.buyer?.username || 'Unknown'}</p>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-700">
              <span className="font-medium text-green-700">{formatCurrency(entry.price)}</span>
              <span>Qty: {entry.quantity}</span>
              {entry.createdAt && <span>• {new Date(entry.createdAt).toLocaleDateString()}</span>}
              {entry.status && <span className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded">{entry.status}</span>}
            </div>
          </div>
          <div>
            {entry.orderId ? (
              <Link to={`/orders/${entry.orderId}`} className="px-3 py-1 border rounded text-sm">View order</Link>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SalesTab;