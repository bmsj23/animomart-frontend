import { CATEGORY_DATA } from '../../../constants/categories';

const CONDITION_OPTIONS = ['New', 'Like New', 'Good', 'Fair'];

const PricingSection = ({ formData, errors, onChange, onConditionChange }) => {
  const selectedCategory = CATEGORY_DATA.find(cat => cat.name === formData.mainCategory);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (₱) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={onChange}
            min="0"
            step="0.01"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={onChange}
            min="0"
            step="1"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.stock ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
          />
          {errors.stock && <p className="text-sm text-red-500 mt-1">{errors.stock}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main Category <span className="text-red-500">*</span>
          </label>
          <select
            name="mainCategory"
            value={formData.mainCategory}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 hover:cursor-pointer"
          >
            <option value="">Select main category</option>
            {CATEGORY_DATA.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subcategory <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={onChange}
            disabled={!formData.mainCategory}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed hover:cursor-pointer ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select subcategory</option>
            {selectedCategory?.subcategories.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Condition <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CONDITION_OPTIONS.map(condition => (
            <button
              key={condition}
              type="button"
              onClick={() => onConditionChange(condition)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors hover:cursor-pointer ${
                formData.condition === condition
                  ? 'bg-green-800 text-white border-green-800'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {condition}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default PricingSection;