const WishlistHeader = ({ productsCount, totalProducts }) => {
  return (
    <div className="mb-10 md:mb-12">
      <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-main mb-3 tracking-tight">
        Wishlist
      </h1>
      <p className="text-gray text-base md:text-lg font-light">
        Showing {productsCount} of {totalProducts || 0} products
      </p>
    </div>
  );
};

export default WishlistHeader;