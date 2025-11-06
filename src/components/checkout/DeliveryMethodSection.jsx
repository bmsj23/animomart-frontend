import { Package, MapPin } from 'lucide-react';

const DeliveryMethodSection = ({ form, setForm, handleChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4">Delivery Method</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <button
          type="button"
          onClick={() => setForm(f => ({ ...f, deliveryMethod: 'shipping' }))}
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
          onClick={() => setForm(f => ({ ...f, deliveryMethod: 'meetup' }))}
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
              className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City *</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Postal Code *</label>
              <input
                name="postal"
                value={form.postal}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
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
            className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select a location</option>
            <option>North Lounge</option>
            <option>South Lounge</option>
            <option>Chez Rafael Canteen</option>
            <option>CBEAM Grounds</option>
            <option>College Lobby</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default DeliveryMethodSection;