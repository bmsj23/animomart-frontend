const BasicInfoSection = ({ formData, errors, charCounts, onChange }) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
          maxLength={200}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g. calculus textbook 9th edition"
        />
        <div className="flex justify-between mt-1">
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          <p className="text-xs text-gray-500 ml-auto">{charCounts.name}/200</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          maxLength={2000}
          rows={6}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="describe your product in detail..."
        />
        <div className="flex justify-between mt-1">
          {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          <p className="text-xs text-gray-500 ml-auto">{charCounts.description}/2000</p>
        </div>
      </div>
    </>
  );
};

export default BasicInfoSection;