import { useState } from 'react';
import { Star, Upload, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { uploadSingleImage } from '../../api/upload';
import { logger } from '../../utils/logger';

const ReviewForm = ({ productId, orderId, onSubmit, onCancel, existingReview }) => {
  const { error: showError } = useToast();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(existingReview?.reviewText || '');
  const [images, setImages] = useState(
    existingReview?.images?.map(url => ({ url, isExisting: true })) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      showError('maximum 3 images allowed');
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, { file, preview: reader.result, isExisting: false }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      showError('please select a rating');
      return;
    }

    if (!reviewText.trim()) {
      showError('please write a review');
      return;
    }

    setIsSubmitting(true);
    try {
      const imageUrls = [];
      for (const img of images) {
        if (img.isExisting) {
          imageUrls.push(img.url);
        } else if (img.file) {
          try {
            const uploaded = await uploadSingleImage(img.file, 'review');
            const url = uploaded?.url || uploaded?.secure_url || uploaded?.data?.url || uploaded?.imageUrl;
            if (url) {
              imageUrls.push(url);
            }
          } catch (uploadErr) {
            logger.error('failed to upload image:', uploadErr);
            showError('failed to upload one or more images');
          }
        }
      }

      await onSubmit({
        productId,
        orderId,
        rating,
        reviewText: reviewText.trim(),
        images: imageUrls,
      });
    } catch (err) {
      logger.error('failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>

      {/* rating selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating *
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="hover:cursor-pointer focus:outline-none"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm text-gray-600 ml-2">
              {rating} {rating === 1 ? 'star' : 'stars'}
            </span>
          )}
        </div>
      </div>

      {/* review text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review *
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="share your experience with this product..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">
            minimum 10 characters
          </span>
          <span className="text-xs text-gray-500">
            {reviewText.length}/500
          </span>
        </div>
      </div>

      {/* image upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Photos (optional)
        </label>
        <div className="flex gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative">
              <img
                src={img.preview || img.url}
                alt={`Preview ${idx + 1}`}
                className="w-20 h-20 object-cover rounded border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 hover:cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {images.length < 3 && (
            <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-green-500 hover:cursor-pointer transition-colors">
              <Upload className="w-6 h-6 text-gray-400" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          you can upload up to 3 images
        </p>
      </div>

      {/* actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0 || !reviewText.trim()}
          className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium hover:cursor-pointer"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 font-medium hover:cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ReviewForm;