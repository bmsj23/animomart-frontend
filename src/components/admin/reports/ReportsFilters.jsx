const ReportsFilters = ({ filterStatus, onFilterChange }) => {
  const filters = [
    { value: 'all', label: 'All Reports', colorClass: 'bg-red-600' },
    { value: 'pending', label: 'Pending', colorClass: 'bg-amber-600' },
    { value: 'reviewed', label: 'Reviewed', colorClass: 'bg-blue-600' },
    { value: 'resolved', label: 'Resolved', colorClass: 'bg-green-600' },
  ];

  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded-xl font-medium transition-all hover:cursor-pointer ${
            filterStatus === filter.value
              ? `${filter.colorClass} text-white`
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default ReportsFilters;