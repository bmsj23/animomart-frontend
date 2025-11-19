import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProductGallery = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const safeImages = Array.isArray(images) && images.length > 0 ? images : ['https://via.placeholder.com/600'];
  const hasMultiple = safeImages.length > 1;

  const goToPrev = () => {
    setSelectedImage((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  const goToNext = () => {
    setSelectedImage((prev) => (prev + 1) % safeImages.length);
  };

  return (
    <div>
      <div className="relative aspect-square rounded-2xl bg-gray-50 border border-gray-200 p-6 flex items-center justify-center overflow-hidden">
        <img
          src={safeImages[selectedImage]}
          alt={productName}
          className="w-full h-full object-contain drop-shadow rounded-lg"
        />

        {hasMultiple && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-gray-700 shadow-md hover:bg-white hover:cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-gray-700 shadow-md hover:bg-white hover:cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        {hasMultiple && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-4 py-2 shadow-sm">
            {safeImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-2.5 h-2.5 rounded-full border border-gray-300 transition-all hover:cursor-pointer ${
                  selectedImage === index ? 'bg-green-800 border-green-800 scale-110' : 'bg-white'
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;