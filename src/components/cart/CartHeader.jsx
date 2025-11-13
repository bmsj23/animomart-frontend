const CartHeader = ({
  hasItems,
  itemCount,
  allSelected,
  selectedCount,
  onToggleSelectAll,
  onBulkDelete
}) => {
  return (
    <div className="flex items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
      {hasItems && (
        <div className="flex items-center gap-4 ml-103">
          <label className="inline-flex items-center gap-2 hover:cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleSelectAll}
              className="w-4 h-4 accent-green-600 border-gray-300 rounded hover:cursor-pointer"
              aria-label="Select all items"
            />
            <span className="text-md">Select All ({itemCount})</span>
          </label>
          <button
            onClick={onBulkDelete}
            disabled={selectedCount === 0}
            className="text-md text-black-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default CartHeader;