import { useState, useEffect } from 'react';
import { Star, Filter } from 'lucide-react';
import ReviewCard from './ReviewCard';
import LoadingSpinner from './LoadingSpinner';
import { getProductReviews, markReviewHelpful, addSellerResponse } from '../../api/reviews';
import { useToast } from '../../hooks/useToast';
import { logger } from '../../utils/logger';

const ReviewList = ({ productId, canRespond = false, sellerId }) => {
  const { success, error: showError } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState([0, 0, 0, 0, 0]);
  const [filterRating, setFilterRating] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, filterRating, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 10 };
      if (filterRating) params.rating = filterRating;

      const data = await getProductReviews(productId, params);
      logger.log('review api response:', data);

      setReviews(data.data.reviews || []);
      setAverageRating(data.data.averageRating || 0);
      setTotalReviews(data.data.totalReviews || 0);
      setTotalPages(data.data.pagination?.totalPages || 1);

      logger.log('average rating:', data.data.averageRating);
      logger.log('total reviews:', data.data.totalReviews);
      logger.log('rating distribution:', data.data.ratingDistribution);

      if (data.data.ratingDistribution) {
        setRatingDistribution(data.data.ratingDistribution);
      } else {
        const dist = [0, 0, 0, 0, 0];
        (data.data.reviews || []).forEach((review) => {
          if (review.rating >= 1 && review.rating <= 5) {
            dist[review.rating - 1]++;
          }
        });
        setRatingDistribution(dist);
      }
    } catch (err) {
      logger.error('failed to fetch reviews:', err);
      showError('failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await markReviewHelpful(reviewId);
      success('marked as helpful!');
      fetchReviews();
    } catch (err) {
      logger.error('failed to mark helpful:', err);
      showError('failed to mark as helpful');
    }
  };

  const handleAddResponse = async (reviewId, responseText) => {
    try {
      await addSellerResponse(reviewId, responseText);
      success('response added successfully!');
      fetchReviews();
    } catch (err) {
      logger.error('failed to add response:', err);
      showError(err.response?.data?.message || 'failed to add response');
      throw err;
    }
  };



  if (loading && currentPage === 1) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* rating summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* average rating */}
          <div className="flex flex-col items-center justify-center md:w-1/3 border-r border-gray-200">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* rating distribution */}
          <div className="flex-1">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDistribution[star - 1] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                return (
                  <div key={star} className="flex items-center gap-3">
                    <button
                      onClick={() => setFilterRating(filterRating === star ? null : star)}
                      className={`flex items-center gap-1 text-sm hover:cursor-pointer ${
                        filterRating === star ? 'text-green-600 font-medium' : 'text-gray-600'
                      }`}
                    >
                      {star} <Star className="w-3 h-3" />
                    </button>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* filter */}
      {filterRating && (
        <div className="mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Showing {filterRating}-star reviews
          </span>
          <button
            onClick={() => {
              setFilterRating(null);
              setCurrentPage(1);
            }}
            className="text-sm text-green-600 hover:text-green-700 font-medium hover:cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>no reviews yet for this product</p>
          <p className="text-sm mt-2">be the first to review!</p>
        </div>
      ) : (
        <>
          <div>
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onMarkHelpful={handleMarkHelpful}
                onAddResponse={handleAddResponse}
                canRespond={canRespond && review.seller === sellerId}
              />
            ))}
          </div>

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewList;