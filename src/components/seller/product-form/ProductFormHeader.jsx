const ProductFormHeader = ({ isEditMode }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">
        {isEditMode ? 'Edit Product' : 'Create New Product'}
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        {isEditMode ? 'Update your product details' : 'Fill in the details to list your product'}
      </p>
    </div>
  );
};

export default ProductFormHeader;