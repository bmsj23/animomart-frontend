const ShippingSection = ({ formData, errors, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="shippingAvailable"
          id="shippingAvailable"
          checked={formData.shippingAvailable}
          onChange={onChange}
          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 hover:cursor-pointer"
        />
        <label htmlFor="shippingAvailable" className="text-sm font-medium text-gray-700 hover:cursor-pointer">
          Shipping Available
        </label>
      </div>

      {formData.shippingAvailable && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shipping Fee (₱) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="shippingFee"
            value={formData.shippingFee}
            onChange={onChange}
            min="0"
            step="0.01"
            className={`w-full sm:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.shippingFee ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          {errors.shippingFee && <p className="text-sm text-red-500 mt-1">{errors.shippingFee}</p>}
        </div>
      )}
    </div>
  );
};

export default ShippingSection;