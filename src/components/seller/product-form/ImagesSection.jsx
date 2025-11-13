import { Upload, X, Loader } from 'lucide-react';

const ImagesSection = ({
  images,
  errors,
  uploadingImages,
  onImageUpload,
  onRemoveImage
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Product Images <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-gray-500 mb-3">Upload 1-5 images. First image will be the cover.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`product ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            {index === 0 && (
              <span className="absolute bottom-1 left-1 px-2 py-1 bg-green-600 text-white text-xs rounded">
                cover
              </span>
            )}
          </div>
        ))}

        {images.length < 5 && (
          <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-green-500 transition-colors hover:cursor-pointer">
            {uploadingImages ? (
              <Loader className="w-8 h-8 text-gray-400 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">Upload Image</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onImageUpload}
              disabled={uploadingImages}
              className="hidden"
            />
          </label>
        )}
      </div>
      {errors.images && <p className="text-sm text-red-500 mt-2">{errors.images}</p>}
    </div>
  );
};

export default ImagesSection;