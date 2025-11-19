import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import { formatCurrency } from "../../utils/formatCurrency";

const getEmptyStateContent = (statusFilter) => {
  const states = {
    shipped: {
      image: '/assets/Shipped.PNG',
      title: 'No Shipped Sales',
      description: 'Sales marked as shipped will appear here'
    },
    completed: {
      image: '/assets/NoProducts.png',
      title: 'No Completed Sales',
      description: 'Completed sales will appear here'
    },
    cancelled: {
      image: '/assets/NoProducts.png',
      title: 'No Cancelled Sales',
      description: 'Cancelled sales will appear here'
    },
    pending: {
      image: '/assets/NoProducts.png',
      title: 'No Pending Sales',
      description: 'Pending sales will appear here'
    },
    processing: {
      image: '/assets/NoProducts.png',
      title: 'No Processing Sales',
      description: 'Processing sales will appear here'
    },
    all: {
      image: '/assets/NoProducts.png',
      title: 'No Sales Found',
      description: 'Your sales will appear here'
    }
  };
  return states[statusFilter] || states.all;
};

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

const SalesTab = ({ sales, loading, error }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPage = parseInt(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(Math.max(1, urlPage));
  const [statusFilter, setStatusFilter] = useState("all");

  // filter sales by status
  const filteredSales = sales?.filter(sale => {
    if (statusFilter === "all") return true;
    if (statusFilter === "processing") {
      return sale.status === "processing" || sale.status === "ready" || sale.status === "shipped";
    }
    return sale.status === statusFilter;
  }) ?? [];

  const totalItems = filteredSales.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pagedSales = filteredSales.slice(start, start + ITEMS_PER_PAGE);

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

  if (sales.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-700 mb-4">You haven't made any sales yet.</p>
        <Link to="/profile?tab=listings" className="px-4 py-2 bg-green-800 text-white rounded-md">View my listings</Link>
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

      {filteredSales.length === 0 ? (
        <div className="py-8 text-center">
          <img
            src={getEmptyStateContent(statusFilter).image}
            alt="No sales"
            className="w-65 h-48 md:w-56 md:h-56 object-contain mx-auto mb-4 animate-slide-in"
          />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{getEmptyStateContent(statusFilter).title}</h3>
          <p className="text-gray-600">{getEmptyStateContent(statusFilter).description}</p>
        </div>
      ) : (
        <>
          {pagedSales.map((entry, idx) => (
        <div key={entry.orderId + '-' + idx} className="bg-white border border-gray-100 rounded-lg p-4 flex items-center gap-4">
          <div className="w-32 shrink-0">
            <img src={entry.product?.image || entry.product?.images?.[0] || '/api/placeholder/400/320'} alt={entry.product?.name || 'Product'} className="w-full h-24 object-cover rounded" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{entry.product?.name || 'Product'}</h3>
            <p className="text-sm text-gray-600">Buyer: {entry.buyer?.name || entry.buyer?.email || entry.buyer?.username || 'Unknown'}</p>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-700">
              <span className="font-medium text-green-700">{formatCurrency(entry.price)}</span>
              <span>Qty: {entry.quantity}</span>
              {entry.createdAt && <span>• {new Date(entry.createdAt).toLocaleDateString()}</span>}
              {entry.status && <span className={`ml-2 text-xs px-2 py-1 rounded ${getStatusColor(entry.status)}`}>{entry.status}</span>}
            </div>
          </div>
          <div>
            {entry.orderId ? (
              <Link to={`/seller/orders/${entry.orderId}`} className="px-3 py-1 border rounded text-sm hover:cursor-pointer hover:bg-gray-50">View order</Link>
            ) : null}
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

export default SalesTab;