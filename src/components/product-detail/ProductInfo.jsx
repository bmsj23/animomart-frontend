const ProductInfo = ({
  product,
  formatPrice,
  formatCondition,
  formatCategory,
  isOutOfStock,
  children,
  className = ''
}) => {
  const rawNotes = product.notes?.length
    ? product.notes
    : product.tags?.length
      ? product.tags
      : [
          formatCondition(product.condition),
          isOutOfStock ? 'out of stock' : null
        ];
  const noteTags = rawNotes.filter((note, index) => note && rawNotes.indexOf(note) === index);

  return (
    <div className={`rounded-2xl border border-green-50 bg-white shadow-sm p-6 space-y-6 ${className}`}>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-green-700 font-semibold">
          {formatCategory(product.category)}
        </p>
        <h1 className="text-4xl md:text-5xl font-serif font-light text-gray-900 leading-snug tracking-tight">
          {product.name}
        </h1>
        <p className="text-5xl font-light text-green-800 tracking-tight">
          {formatPrice(product.price)}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-green-700 font-semibold">description</p>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
          {product.description}
        </p>
      </div>

      {noteTags.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-green-700 font-semibold">main notes</p>
          <div className="flex flex-wrap gap-2">
            {noteTags.map((note, index) => (
              <span
                key={`${note}-${index}`}
                className="px-4 py-2 rounded-full border border-green-100 bg-green-50 text-sm font-medium text-green-800"
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      )}

      {children && (
        <div className="pt-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

export default ProductInfo;