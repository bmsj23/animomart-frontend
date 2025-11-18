import { Star, ThumbsUp, MessageSquare, X } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import { useState } from 'react';
import { logger } from '../../utils/logger';

const ReviewCard = ({ review, onMarkHelpful, onAddResponse, canRespond = false }) => {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState({ isOpen: false, imageUrl: '', index: 0 });

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddResponse(review._id, responseText);
      setResponseText('');
      setShowResponseForm(false);
    } catch (error) {
      logger.error('failed to submit response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-b border-gray-200 py-6 last:border-0">
      {/* reviewer info */}
      <div className="flex items-start gap-4 mb-3">
        {review.buyer?.profilePicture ? (
          <img
            src={review.buyer.profilePicture}
            alt={review.buyer.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-green-700">
              {review.buyer?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{review.buyer?.name || 'Anonymous'}</span>
            {review.isVerifiedPurchase && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Verified Purchase
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 pointer-events-none ${
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* review text */}
      {review.reviewText && (
        <p className="text-gray-700 mb-3 ml-14">{review.reviewText}</p>
      )}

      {/* review images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-3 ml-14">
          {review.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Review ${idx + 1}`}
              className="w-20 h-20 object-cover rounded border border-gray-200 hover:opacity-75 transition-opacity hover:cursor-pointer"
              onClick={() => setImagePreview({ isOpen: true, imageUrl: img, index: idx })}
            />
          ))}
        </div>
      )}

      {/* seller response */}
      {review.sellerResponse && review.sellerResponse.text && (
        <div className="ml-14 mt-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-900">Seller Response</span>
            <span className="text-xs text-amber-600">
              {formatDate(review.sellerResponse.respondedAt)}
            </span>
          </div>
          <p className="text-sm text-gray-700">{review.sellerResponse.text}</p>
        </div>
      )}

      {/* actions */}
      <div className="flex items-center gap-4 ml-14 mt-3">
        <button
          onClick={() => onMarkHelpful(review._id)}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors hover:cursor-pointer"
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Helpful ({review.helpfulCount || 0})</span>
        </button>

        {canRespond && !review.sellerResponse?.text && (
          <button
            onClick={() => setShowResponseForm(!showResponseForm)}
            className="text-sm text-green-600 hover:text-green-700 font-medium hover:cursor-pointer"
          >
            Respond
          </button>
        )}
      </div>

      {/* response form */}
      {showResponseForm && (
        <div className="ml-14 mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Response
          </label>
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="respond to this review..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {responseText.length}/300 characters
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowResponseForm(false);
                  setResponseText('');
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitResponse}
                disabled={!responseText.trim() || isSubmitting}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Response'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* image preview modal */}
      {imagePreview.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setImagePreview({ isOpen: false, imageUrl: '', index: 0 })}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setImagePreview({ isOpen: false, imageUrl: '', index: 0 })}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 hover:cursor-pointer"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={imagePreview.imageUrl}
              alt="Review image preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;