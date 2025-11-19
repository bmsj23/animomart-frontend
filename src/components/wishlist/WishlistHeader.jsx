const WishlistHeader = ({ totalProducts }) => {
  return (
    <div className="mb-10 md:mb-12">
      <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-main mb-3 tracking-tight">
        Wishlist
      </h1>
      <p className="text-gray text-base md:text-lg font-light">
        {totalProducts || 0} {totalProducts === 1 ? 'item' : 'items'}
      </p>
    </div>
  );
};

export default WishlistHeader;