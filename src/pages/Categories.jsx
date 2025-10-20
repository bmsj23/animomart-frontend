const Categories = () => {
  const categories = [
    'School Supplies',
    'Electronics',
    'Books',
    'Clothing',
    'Food & Beverages',
    'Handmade Items',
    'Sports Equipment',
    'Dorm Essentials',
    'Beauty & Personal Care',
    'Others',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Categories</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <div
            key={category}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-center font-medium text-gray-900">{category}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
