import { Link } from 'react-router-dom';

const SellerInfo = ({ seller, productId, isOwnProduct }) => {
  const initials = seller?.name?.trim()?.slice(0, 2)?.toUpperCase();
  const usernameLabel = seller?.username ? `@${seller.username}` : '@animomart';
  const listingCount = typeof seller?.listingsCount === 'number'
    ? seller.listingsCount
    : Array.isArray(seller?.listings)
      ? seller.listings.length
      : typeof seller?.totalListings === 'number'
        ? seller.totalListings
        : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        {seller?.profilePicture ? (
          <img
            src={seller.profilePicture}
            alt={seller?.name || 'Seller'}
            className="w-14 h-14 rounded-full object-cover border border-gray-200"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-green-800 text-white flex items-center justify-center text-lg font-semibold">
            {initials || 'AN'}
          </div>
        )}
        <div className="flex-1">
          <p className="text-lg font-medium text-gray-900">{seller?.name}</p>
          <p className="text-sm text-gray-500">{usernameLabel}</p>
        </div>
            {!isOwnProduct && (
              <Link
                to={`/messages?user=${seller?._id}&product=${productId}`}
                className="px-4 py-2.5 rounded-xl bg-green-800 text-white font-semibold text-sm hover:bg-green-700 hover:cursor-pointer transition-colors"
              >
                Contact
              </Link>
            )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-4 border border-gray-100 rounded-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500 mb-1">listings</p>
          <p className="text-base font-semibold text-gray-900">{listingCount}</p>
        </div>
        <div className="p-4 border border-gray-100 rounded-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500 mb-1">rating</p>
          <p className="text-base font-semibold text-gray-900">{seller?.rating ? `${seller.rating.toFixed?.(1)}` : 'new'}</p>
        </div>
      </div>

    </div>
  );
};

export default SellerInfo;