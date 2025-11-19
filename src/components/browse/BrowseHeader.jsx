const BrowseHeader = ({ totalProducts, currentPage, itemsPerPage }) => {
  const startItem = totalProducts === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalProducts);

  return (
    <div className="mb-10 md:mb-12">
      <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-main mb-3 tracking-tight">
        Browse All Products
      </h1>
      <p className="text-gray text-base md:text-lg font-light">
        Showing {startItem} to {endItem} of {totalProducts || 0} products
      </p>
    </div>
  );
};

export default BrowseHeader;