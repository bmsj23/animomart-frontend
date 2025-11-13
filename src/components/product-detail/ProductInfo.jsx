const ProductInfo = ({
  product,
  formatPrice,
  formatCondition,
  formatCategory,
  isOutOfStock
}) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

      <div className="mb-6">
        <p className="text-4xl font-bold text-green-600">{formatPrice(product.price)}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          {formatCondition(product.condition)}
        </span>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {formatCategory(product.category)}
        </span>
        {isOutOfStock && (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            Out of Stock
          </span>
        )}
      </div>

      <div className="mb-6">
        <p className="text-gray-700">
          <span className="font-medium">Stock:</span> {product.stock} available
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
        <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
      </div>

      {product.meetupLocations?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Meetup Locations</h2>
          <div className="flex flex-wrap gap-2">
            {product.meetupLocations.map((location, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                {location}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;