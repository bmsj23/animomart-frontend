import { Link } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import { formatCurrency } from "../../utils/formatCurrency";

const ListingsTab = ({ myListings, loading, error }) => {
  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (myListings.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-700 mb-4">You haven't listed any products yet.</p>
        <Link to="/sell" className="px-4 py-2 bg-green-600 text-white rounded-md">List a product</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {myListings.map((product) => (
        <div key={product._id} className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
          <Link to={`/products/${product._id}`} className="block">
            <img
              src={product.image || product.images?.[0] || '/api/placeholder/400/320'}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
          </Link>

          <div className="p-4">
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
            <div className="flex items-center justify-between">
              <span className="text-green-700 font-bold">{formatCurrency(product.price)}</span>
              <span className="text-xs text-gray-500">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListingsTab;