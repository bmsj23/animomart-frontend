import { useState } from 'react';

const ProductGallery = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div>
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
        <img
          src={images?.[selectedImage] || 'https://via.placeholder.com/600'}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>

      {images?.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 hover:cursor-pointer ${
                selectedImage === index ? 'border-green-600' : 'border-gray-200'
              }`}
            >
              <img src={image} alt={`${productName} ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;