import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import { formatCurrency } from "../../utils/formatCurrency";

const ITEMS_PER_PAGE = 20;

const ListingsTab = ({ myListings: allProducts, loading, error }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("listingsPage")) || 1
  );

  useEffect(() => {
    if (!allProducts) return;

    const pageFromUrl = parseInt(searchParams.get("listingsPage")) || 1;
    setCurrentPage(pageFromUrl);

    const totalProducts = allProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE));
    const start = (pageFromUrl - 1) * ITEMS_PER_PAGE;
    const paged = allProducts.slice(start, start + ITEMS_PER_PAGE);

    setProducts(paged);
    setPagination({ totalProducts, totalPages });
  }, [allProducts, searchParams]);

  const handlePageChange = (page) => {
    setCurrentPage(page);

    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);

    const filtered = applyFiltersAndSort(wishlist || [], filters.sort);
    const limit = 20;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    setProducts(paged);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <LoadingSpinner size="lg" />;

  if (error) return <p className="text-red-600">{error}</p>;

  if (!allProducts || allProducts.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-700 mb-4">
          You haven't listed any products yet.
        </p>
        <Link
          to="/sell"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
        {products.map((product) => (
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-5 py-2.5 border border-gray-200 rounded-full hover:bg-green-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">{renderPagination()}</div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="px-5 py-2.5 border border-gray-200 rounded-full hover:bg-green-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ListingsTab;