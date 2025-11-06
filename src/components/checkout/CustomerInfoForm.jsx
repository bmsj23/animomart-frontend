const CustomerInfoForm = ({ form, handleChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4">Customer Information</h2>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="09123456789"
            className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </form>
    </div>
  );
};

export default CustomerInfoForm;