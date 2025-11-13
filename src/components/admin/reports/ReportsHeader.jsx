import { AlertTriangle } from 'lucide-react';

const ReportsHeader = ({ pendingCount }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports Management</h1>
        <p className="text-gray-600 mt-1">Review and handle user reports</p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-red-500 to-red-600 text-white rounded-2xl">
        <AlertTriangle className="w-5 h-5" />
        <span className="font-semibold">{pendingCount} Pending</span>
      </div>
    </div>
  );
};

export default ReportsHeader;