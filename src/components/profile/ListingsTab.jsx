import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import { formatCurrency } from "../../utils/formatCurrency";

const ITEMS_PER_PAGE = 16; 

const ListingsTab = ({ myListings: rawListings, loading, error }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlPage = parseInt(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(
    Math.max(1, urlPage)
  );

  const totalItems = rawListings?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pagedListings = rawListings?.slice(start, start + ITEMS_PER_PAGE) ?? [];

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

  if (loading) return <LoadingSpinner size="lg" />;

  if (error) return <p className="text-red-600">{error}</p>;

  if (totalItems === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-700 mb-4">
          You haven't listed any products yet.
        </p>
        <Link
          to="/sell"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          List a product
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {pagedListings.map((product) => (
          <div
            key={product._id}
            className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm"
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

            <div className="p-4">
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
            </div>
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
    </div>
  );
};

export default ListingsTab;