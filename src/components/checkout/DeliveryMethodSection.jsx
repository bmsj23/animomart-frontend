import { Package, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

const DeliveryMethodSection = ({ form, setForm, handleChange, showAllErrors = false, validateSignal = null, onSectionEnter }) => {
  // When validateSignal changes (non-null), show required-field errors for this section
  const [triggerValidation, setTriggerValidation] = useState(false);
  // has the user already entered/interacted with this section? prevent repeated signals
  const [entered, setEntered] = useState(false);

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4">Delivery Method</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <button
          type="button"
          onClick={() => {
            setForm(f => ({ ...f, deliveryMethod: 'shipping' }));
            triggerEnter();
          }}
          className={`p-4 border-2 rounded-lg transition-all hover:cursor-pointer ${
            form.deliveryMethod === 'shipping'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Package className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <div className="font-medium">Shipping</div>
          <div className="text-xs text-gray-500">Delivered to your address</div>
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
              onFocus={triggerEnter}
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
                onFocus={triggerEnter}
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
                onFocus={triggerEnter}
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
              onFocus={triggerEnter}
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
            onFocus={triggerEnter}
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