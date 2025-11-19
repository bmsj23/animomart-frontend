import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Star, Filter } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import { formatCurrency } from "../../utils/formatCurrency";

const ITEMS_PER_PAGE = 20;

const getStatusColor = (status) => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower === 'pending') return 'bg-yellow-100 text-yellow-700';
  if (statusLower === 'processing' || statusLower === 'ready') return 'bg-blue-100 text-blue-700';
  if (statusLower === 'shipped') return 'bg-purple-100 text-purple-700';
  if (statusLower === 'completed' || statusLower === 'delivered') return 'bg-green-100 text-green-700';
  if (statusLower === 'cancelled' || statusLower === 'canceled') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
};

const PurchasesTab = ({
  purchaseOrders,
  loading,
  error,
  canReview,
  onWriteReview
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPage = parseInt(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(Math.max(1, urlPage));
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = purchaseOrders?.filter(order => {
    if (statusFilter === "all") return true;
    if (statusFilter === "processing") {
      return order.status === "processing" || order.status === "ready" || order.status === "shipped";
    }
    return order.status === statusFilter;
  }) ?? [];

  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pagedOrders = filteredOrders.slice(start, start + ITEMS_PER_PAGE);

  useEffect(() => {
    const safePage = Math.max(1, Math.min(urlPage, totalPages));
    if (safePage !== currentPage) {
      setCurrentPage(safePage);
    }
  }, [urlPage, totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", "1");
    setSearchParams(newParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

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

  if (purchaseOrders.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-700 mb-4">You haven't purchased any products yet.</p>
        <Link to="/browse" className="px-4 py-2 bg-green-600 text-white rounded-md">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* filter bar */}
      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-gray-600" />
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "processing", label: "Processing" },
            { value: "shipped", label: "Shipped" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" }
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:cursor-pointer ${
                statusFilter === filter.value
                  ? "bg-green-800 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-700">No {statusFilter !== "all" ? statusFilter : ""} orders found</p>
        </div>
      ) : (
        <>
          {pagedOrders.map((order) => (
        <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold">Order #{order.orderNumber || order._id?.slice(-8)}</h3>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <span className={`inline-block mt-1 text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-green-700">
                {formatCurrency(order.totalAmount)}
              </span>
              <Link
                to={`/orders/${order._id}`}
                className="flex items-center gap-2 px-4 py-2 bg-green-800 text-white rounded-lg text-sm hover:bg-green-700 transition-colors hover:cursor-pointer"
              >
                View Order
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {(order.items || []).map((item, idx) => {
              const product = item.product || item;
              const productId = product._id || product.id;
              const reviewable = canReview(order, productId);

              return (
                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Link to={productId ? `/products/${productId}` : '#'} className="shrink-0">
                    <img
                      src={product.image || product.images?.[0] || '/api/placeholder/400/320'}
                      alt={product.name || 'Product'}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </Link>

                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{product.name || 'Product'}</h4>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(item.price || product.price || 0)} × {item.quantity}
                    </p>
                  </div>

                  {order.status === 'completed' && reviewable && (
                    <button
                      onClick={() => onWriteReview(order, product)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors hover:cursor-pointer"
                    >
                      Write Review
                    </button>
                  )}

                  {order.status === 'completed' && !reviewable && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      Reviewed
                    </span>
                  )}
                </div>
              );
            })}
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
        </>
      )}
    </div>
  );
};

export default PurchasesTab;