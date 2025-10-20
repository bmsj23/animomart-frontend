const Search = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Products</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search for products..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <p className="text-gray-600">Search results will appear here.</p>
    </div>
  );
};

export default Search;
