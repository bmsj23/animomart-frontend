const DeliveryOptions = ({ product, formatPrice, className = '' }) => {
  const shippingLabel = product.shippingAvailable !== false ? 'Shipping available' : 'Meetup only';
  const shippingFee = product.shipping_fee ?? product.shippingFee;
  const parsedShippingFee = typeof shippingFee === 'number' ? shippingFee : parseFloat(shippingFee);
  const hasShippingFee = Number.isFinite(parsedShippingFee);
  const meetupLocations = Array.isArray(product.meetupLocations) ? product.meetupLocations : [];

  const details = [
    {
      label: 'Delivery',
      value: shippingLabel
    },
    {
      label: 'Shipping fee',
      value: hasShippingFee ? formatPrice(parsedShippingFee) : 'Not specified'
    },
    {
      label: 'Meetup Details',
      value: meetupLocations.length > 0 ? meetupLocations.join(' • ') : 'Around DLSL Campus'
    },
    {
      label: 'Stock status',
      value: product.stock > 0 ? 'Available' : 'Out of stock'
    }
  ];

  return (
    <div className={`rounded-2xl border border-green-50 bg-white shadow-sm p-6 space-y-4 ${className}`}>
      <p className="text-xs uppercase tracking-[0.35em] text-green-700 font-semibold">delivery options</p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {details.map((detail, index) => (
          <div key={`${detail.label}-${index}`} className="space-y-1">
            <dt className="text-xs uppercase tracking-[0.3em] text-gray-500">{detail.label}</dt>
            <dd className="text-base text-gray-900 leading-snug">
              {detail.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default DeliveryOptions;