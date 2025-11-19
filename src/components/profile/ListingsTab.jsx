import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import { formatCurrency } from "../../utils/formatCurrency";

const ITEMS_PER_PAGE = 20;

const ListingsTab = ({ myListings: allProducts, loading, error }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredListings = allProducts?.filter(product => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.name?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  }) ?? [];

  const totalItems = filteredListings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pagedListings = filteredListings.slice(start, start + ITEMS_PER_PAGE);

  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get("page")) || 1;
    const safePage = Math.max(1, Math.min(pageFromUrl, totalPages));
    if (safePage !== currentPage) {
      setCurrentPage(safePage);
    }
  }, [searchParams, totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", "1");
    setSearchParams(newParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

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
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-10 h-10 rounded-full transition-all font-medium text-sm hover:cursor-pointer ${
              currentPage === i
                ? "bg-primary text-white"
                : "border border-gray-200 hover:bg-surface"
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`w-10 h-10 rounded-full transition-all font-medium text-sm hover:cursor-pointer ${
            currentPage === 1
              ? "bg-primary text-white"
              : "border border-gray-200 hover:bg-surface"
          }`}
        >
          1
        </button>
      );

      if (showEllipsisStart) {
        buttons.push(
          <span key="ellipsis-start" className="px-2 text-gray-500">
            ...
          </span>
        );
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-10 h-10 rounded-full transition-all font-medium text-sm hover:cursor-pointer ${
              currentPage === i
                ? "bg-primary text-white"
                : "border border-gray-200 hover:bg-surface"
            }`}
          >
            {i}
          </button>
        );
      }

      if (showEllipsisEnd) {
        buttons.push(
          <span key="ellipsis-end" className="px-2 text-gray-500">
            ...
          </span>
        );
      }

      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`w-10 h-10 rounded-full transition-all font-medium text-sm hover:cursor-pointer ${
            currentPage === totalPages
              ? "bg-primary text-white"
              : "border border-gray-200 hover:bg-surface"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  if (loading) return <LoadingSpinner size="lg" />;

  if (error) return <p className="text-red-600">{error}</p>;

  if ((allProducts?.length ?? 0) === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-700 mb-4">
          You haven't listed any products yet.
        </p>
        <Link
          to="/sell"
          className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 transition-colors hover:cursor-pointer"
        >
          List a product
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search your listings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {filteredListings.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-700">No listings found matching "{searchQuery}"</p>
        </div>
      ) : (
        <>
          {/* grid */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {pagedListings.map((product) => (
              <div
                key={product._id}
                className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <Link to={`/products/${product._id}`} className="block">
                  <img
                    src={
                      product.image ||
                      product.images?.[0] ||
                      "/api/placeholder/400/320"
                    }
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </Link>

                <Link to={`/products/${product._id}`} className="block p-4 hover:cursor-pointer">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-bold">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

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

export default ListingsTab;