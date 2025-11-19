import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useWishlist } from "../hooks/useWishlist";
import WishlistHeader from "../components/wishlist/WishlistHeader";
import WishlistFilters from "../components/wishlist/WishlistFilters";
import WishlistGrid from "../components/wishlist/WishlistGrid";

const Wishlist = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const { wishlist, loading: wishlistLoading, fetchWishlist } = useWishlist();
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    condition: searchParams.get("condition") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
  });

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFiltersAndSort = (items, sortMethod) => {
    let result = [...(items || [])];

    // category
    if (filters.category) {
      result = result.filter(
        (p) => (p.category || "").toString() === filters.category.toString()
      );
    }

    // condition
    if (filters.condition) {
      result = result.filter(
        (p) => (p.condition || "").toString() === filters.condition.toString()
      );
    }

    // price range
    if (filters.minPrice) {
      result = result.filter(
        (p) => Number(p.price) >= Number(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      result = result.filter(
        (p) => Number(p.price) <= Number(filters.maxPrice)
      );
    }

    result = sortProducts(result, sortMethod || filters.sort);

    return result;
  };

  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(pageFromUrl);

    const filtered = applyFiltersAndSort(wishlist || [], filters.sort);

    const limit = 16;
    const totalProducts = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalProducts / limit));
    const start = (pageFromUrl - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    setProducts(paged);
    setPagination({ totalProducts, totalPages });
    setLoading(wishlistLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlist, filters, wishlistLoading, searchParams]);

  const sortProducts = (productsArray, sortMethod) => {
    const sorted = [...productsArray];
    switch (sortMethod) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "trending":
        return sorted.sort((a, b) => {
          const viewsA = a.views || 0;
          const viewsB = b.views || 0;
          return viewsB - viewsA;
        });
      case "newest":
      default:
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  };

  const updateFilter = (key, value) => {
    let processedValue = value;
    if ((key === "minPrice" || key === "maxPrice") && value) {
      processedValue = parseFloat(value) || "";
    }

    const newFilters = { ...filters, [key]: processedValue };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set("page", "1");
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      condition: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
    });
    setSearchParams({});
    setShowFilters(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);

    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);

    const filtered = applyFiltersAndSort(wishlist || [], filters.sort);
    const limit = 16;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    setProducts(paged);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters =
    filters.category ||
    filters.condition ||
    filters.minPrice ||
    filters.maxPrice;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <WishlistHeader
          productsCount={products.length}
          totalProducts={pagination.totalProducts}
        />

        <WishlistFilters
          filters={filters}
          onUpdateFilter={updateFilter}
          onClearFilters={clearFilters}
          showFilters={showFilters}
          onToggleFilters={setShowFilters}
        />

        <WishlistGrid
          products={products}
          loading={loading}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      </div>
    </div>
  );
};

export default Wishlist;