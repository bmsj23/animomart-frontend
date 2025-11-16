import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Star, Edit2, Trash2 } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import React from "react";

const ITEMS_PER_PAGE = 20;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    logger.error("Error caught in ReviewsTab:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <p className="text-red-600">Something went wrong while loading reviews.</p>;
    }
    return this.props.children;
  }
}

const ReviewsTab = ({
  authoredReviews,
  loading,
  error,
  onEditReview,
  onDeleteReview
}) => {
  const safeReviews = Array.isArray(authoredReviews) ? authoredReviews : [];

  const [searchParams, setSearchParams] = useSearchParams();
  const urlPage = parseInt(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(Math.max(1, urlPage));

  const totalItems = safeReviews.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pagedReviews = safeReviews.slice(start, start + ITEMS_PER_PAGE);

  useEffect(() => {
    const safePage = Math.max(1, Math.min(urlPage, totalPages));
    if (safePage !== currentPage) {
      setCurrentPage(safePage);
    }
  }, [urlPage, totalPages, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const buttons = [];

    buttons.push(
      <button
        key={1}
        onClick={() => handlePageChange(1)}
        className={`min-w-11 px-4 py-2.5 rounded-full transition-all font-medium text-sm hover:cursor-pointer hover:bg-primary hover:text-white ${
          currentPage === 1
            ? "bg-primary text-white shadow-md"
            : "border border-gray-200 hover:bg-surface text-main"
        }`}
      >
        1
      </button>
    );

    if (currentPage > 3) {
      buttons.push(
        <span key="left-ellipsis" className="px-2 text-gray">
          ...
        </span>
      );
    }

    for (
      let p = Math.max(2, currentPage - 1);
      p <= Math.min(totalPages - 1, currentPage + 1);
      p++
    ) {
      buttons.push(
        <button
          key={p}
          onClick={() => handlePageChange(p)}
          className={`min-w-11 px-4 py-2.5 rounded-full transition-all font-medium text-sm hover:cursor-pointer hover:bg-primary hover:text-white ${
            currentPage === p
              ? "bg-primary text-white shadow-md"
              : "border border-gray-200 hover:bg-surface text-main"
          }`}
        >
          {p}
        </button>
      );
    }

    if (currentPage < totalPages - 2) {
      buttons.push(
        <span key="right-ellipsis" className="px-2 text-gray">
          ...
        </span>
      );
    }

    if (totalPages > 1) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`min-w-11 px-4 py-2.5 rounded-full transition-all font-medium text-sm hover:cursor-pointer hover:bg-primary hover:text-white ${
            currentPage === totalPages
              ? "bg-primary text-white shadow-md"
              : "border border-gray-200 hover:bg-surface text-main"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (safeReviews.length === 0) {
    return (
      <div className="my-12 py-8 text-center">
        <p className="text-gray-700 mb-4">You haven't written any reviews yet.</p>
        <Link
          to="/profile?tab=purchases"
          className="px-4 py-2 bg-green-600 text-white rounded-md"
        >
          View purchases
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pagedReviews.map((r) => (
        <div
          key={
            r._id ||
            r.id ||
            `${r.product?._id || r.product?.id}-${r.createdAt}`
          }
          className="bg-white border border-gray-100 rounded-lg p-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-20 shrink-0">
              <Link to={r.product?._id ? `/products/${r.product?._id}` : "#"}>
                <img
                  src={
                    r.product?.image ||
                    r.product?.images?.[0] ||
                    "/api/placeholder/160/160"
                  }
                  alt={r.product?.name || "Product"}
                  className="w-full h-16 object-cover rounded"
                />
              </Link>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">
                  {r.product?.name || r.title || "Product"}
                </h3>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < (r.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                {r.reviewText || r.body || r.comment || r.text}
              </p>

              {Array.isArray(r.images) && r.images.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {r.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Review ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-400">
                  {r.createdAt &&
                    `Reviewed on ${new Date(r.createdAt).toLocaleDateString()}`}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditReview?.(r)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors hover:cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteReview?.(r._id)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors hover:cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-5 py-2.5 border border-gray-200 rounded-full hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm hover:cursor-pointer hover:bg-primary hover:text-white"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {renderPagination()}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-5 py-2.5 border border-gray-200 rounded-full hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm hover:cursor-pointer hover:bg-primary hover:text-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// Export wrapped in ErrorBoundary
export default function ReviewsTabWithBoundary(props) {
  return (
    <ErrorBoundary>
      <ReviewsTab {...props} />
    </ErrorBoundary>
  );
}