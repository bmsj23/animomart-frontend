import { Package, MapPin } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { logger } from '../../utils/logger';

const DeliveryMethodSection = ({ form, setForm, handleChange, showAllErrors = false, validateSignal = null, onSectionEnter, cartItems = [] }) => {
  const [triggerValidation, setTriggerValidation] = useState(false);
  const [entered, setEntered] = useState(false);
  const [shippingCheck, setShippingCheck] = useState({ checked: false, enabled: true });

  // memoize the shipping availability check to prevent recalculation on every render
  const shippingAvailable = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return null; // return null when not ready

    const allItems = cartItems.flatMap(group => group.items || []);
    logger.log('Checking shipping availability for items:', allItems.map(item => {
      const product = item.product || item;
      return {
        name: product.name,
        shippingAvailable: product.shippingAvailable
      };
    }));

    const hasShippingDisabledProduct = allItems.some(item => {
      const product = item.product || item;
      return product.shippingAvailable !== true;
    });

    return !hasShippingDisabledProduct;
  }, [cartItems]);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0 || shippingAvailable === null) return;

    setShippingCheck(prev => {
      if (prev.checked && prev.enabled === shippingAvailable) {
        return prev;
      }
      return { checked: true, enabled: shippingAvailable };
    });
  }, [cartItems, shippingAvailable]);

  // if shipping is disabled for any product, default to meetup
  useEffect(() => {
    if (shippingCheck.checked && !shippingCheck.enabled && form.deliveryMethod === 'shipping') {
      setForm(f => ({ ...f, deliveryMethod: 'meetup' }));
    }
  }, [shippingCheck, form.deliveryMethod, setForm]);

  const triggerEnter = () => {
    if (entered) return;
    if (typeof onSectionEnter === 'function') onSectionEnter();
    setEntered(true);
  };

  useEffect(() => {
    if (validateSignal == null) return;
    setTriggerValidation(true);
  }, [validateSignal]);

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      onPointerDown={triggerEnter}
      onKeyDown={(e) => {
        // keyboard interaction (typing/tabbing) should also count as entering
        if (e && e.key) triggerEnter();
      }}
    >
      <h2 className="text-xl font-semibold mb-4">Delivery Method</h2>

      {shippingCheck.checked && !shippingCheck.enabled && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> One or more items in your cart do not support shipping. Please select meetup for delivery.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <button
          type="button"
          onClick={() => {
            if (shippingCheck.enabled) {
              setForm(f => ({ ...f, deliveryMethod: 'shipping' }));
              triggerEnter();
            }
          }}
          disabled={!shippingCheck.enabled}
          className={`p-4 border-2 rounded-lg transition-all ${!shippingCheck.enabled ? 'opacity-50 cursor-not-allowed' : 'hover:cursor-pointer'} ${
            form.deliveryMethod === 'shipping'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Package className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <div className="font-medium">Shipping</div>
          <div className="text-xs text-gray-500">Delivered to your address</div>
          {!shippingCheck.enabled && (
            <div className="text-xs text-red-600 mt-1">Not available</div>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setForm(f => ({ ...f, deliveryMethod: 'meetup' }));
            triggerEnter();
          }}
          className={`p-4 border-2 rounded-lg transition-all hover:cursor-pointer ${
            form.deliveryMethod === 'meetup'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <MapPin className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <div className="font-medium">Meetup</div>
          <div className="text-xs text-gray-500">Pick up in person</div>
        </button>
      </div>

      {form.deliveryMethod === 'shipping' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Address *</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="street, building, unit"
              required
              className={`mt-1 block w-full rounded-md px-3 py-2 focus:ring-2 ${(showAllErrors || triggerValidation) && !form.address ? 'border-red-500 ring-red-100 border' : 'border border-gray-200 focus:ring-green-500 focus:border-transparent'}`}
            />
            {(showAllErrors || triggerValidation) && !form.address && (
              <p className="mt-1 text-sm text-red-600">Please enter your address.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City *</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className={`mt-1 block w-full rounded-md px-3 py-2 focus:ring-2 ${(showAllErrors || triggerValidation) && !form.city ? 'border-red-500 ring-red-100 border' : 'border border-gray-200 focus:ring-green-500 focus:border-transparent'}`}
              />
              {(showAllErrors || triggerValidation) && !form.city && (
                <p className="mt-1 text-sm text-red-600">Please enter your city.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Postal Code *</label>
              <input
                name="postal"
                value={form.postal}
                onChange={handleChange}
                required
                className={`mt-1 block w-full rounded-md px-3 py-2 focus:ring-2 ${(showAllErrors || triggerValidation) && !form.postal ? 'border-red-500 ring-red-100 border' : 'border border-gray-200 focus:ring-green-500 focus:border-transparent'}`}
              />
              {(showAllErrors || triggerValidation) && !form.postal && (
                <p className="mt-1 text-sm text-red-600">Please enter your postal code.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Special Instructions (optional)</label>
            <textarea
              name="specialInstructions"
              value={form.specialInstructions}
              onChange={handleChange}
              rows="2"
              placeholder="e.g., leave at door, call upon arrival"
              className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700">Meetup Location *</label>
          <select
            name="meetupLocation"
            value={form.meetupLocation}
            onChange={handleChange}
            required
            className={`mt-1 block w-full rounded-md px-3 py-2 focus:ring-2 ${(showAllErrors || triggerValidation) && !form.meetupLocation ? 'border-red-500 ring-red-100 border' : 'border border-gray-200 focus:ring-green-500 focus:border-transparent'}`}
          >
            <option value="">Select a location</option>
            <option>North Lounge</option>
            <option>South Lounge</option>
            <option>Chez Rafael Canteen</option>
            <option>CBEAM Grounds</option>
            <option>College Lobby</option>
          </select>
          {(showAllErrors || triggerValidation) && !form.meetupLocation && (
            <p className="mt-1 text-sm text-red-600">Please select a meetup location.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryMethodSection;