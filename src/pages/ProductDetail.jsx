import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Product Detail</h1>
      <p className="text-gray-600">Product ID: {id}</p>
      <p className="text-gray-600 mt-2">Product details will be displayed here.</p>
    </div>
  );
};

export default ProductDetail;
