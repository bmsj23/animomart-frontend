import { Link } from 'react-router-dom';

const SellerInfo = ({ seller, productId, isOwnProduct }) => {
  return (
    <div className="border-t border-gray-200 pt-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h2>
      <div className="flex items-center gap-4">
        {seller?.profilePicture ? (
          <img
            src={seller.profilePicture}
            alt={seller.name}
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold"
          style={{ display: seller?.profilePicture ? 'none' : 'flex' }}
        >
          {seller?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{seller?.name}</p>
          {seller?.businessName && (
            <p className="text-sm text-gray-600">{seller?.businessName}</p>
          )}
        </div>
        {!isOwnProduct && (
          <Link
            to={`/messages?user=${seller?._id}&product=${productId}`}
            className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 hover:cursor-pointer transition-colors font-medium"
          >
            Contact Seller
          </Link>
        )}
      </div>
    </div>
  );
};

export default SellerInfo;