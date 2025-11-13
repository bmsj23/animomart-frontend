import { FileText, User, Calendar, MoreVertical, Eye, CheckCircle } from 'lucide-react';

const ReportsTable = ({
  reports,
  activeDropdown,
  onToggleDropdown,
  onViewReport,
  onOpenActionModal,
  formatDate,
  getStatusColor,
  getPriorityColor,
}) => {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Report ID
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Reporter
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Reported User
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Reason
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {reports.map((report, index) => (
              <tr
                key={report._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-600" />
                    <span className="font-mono text-sm font-medium text-gray-900">
                      {report._id?.slice(-8).toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{report.reporter?.name || 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{report.reportedUser?.name || 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-900 line-clamp-1">{report.reason}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(report.priority || 'medium')}`}>
                    {report.priority || 'medium'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 text-sm">{formatDate(report.createdAt)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end relative">
                    <button
                      onClick={() => onToggleDropdown(report._id)}
                      className="p-1 hover:bg-gray-200 rounded-lg transition-colors hover:cursor-pointer"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                    {activeDropdown === report._id && (
                      <div className={`absolute right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 ${
                        index >= reports.length - 3 ? 'bottom-8' : 'top-8 mt-2'
                      }`}>
                        <button
                          onClick={() => {
                            onViewReport(report);
                            onToggleDropdown(null);
                          }}
                          className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700 hover:cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        {report.status === 'pending' && (
                          <button
                            onClick={() => {
                              onOpenActionModal('review', report);
                              onToggleDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-blue-50 text-blue-600 hover:cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            Mark as Reviewed
                          </button>
                        )}
                        {(report.status === 'pending' || report.status === 'reviewed') && (
                          <button
                            onClick={() => {
                              onOpenActionModal('resolve', report);
                              onToggleDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-green-50 text-green-600 hover:cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Resolve Report
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsTable;