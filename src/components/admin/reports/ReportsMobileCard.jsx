import { FileText, User, Calendar, MoreVertical, Eye, CheckCircle } from 'lucide-react';

const ReportsMobileCard = ({
  reports,
  activeDropdown,
  onToggleDropdown,
  onViewReport,
  onOpenActionModal,
  formatDate,
  getStatusColor,
  getPriorityColor,
}) => {
  if (reports.length === 0) {
    return null;
  }

  return (
    <div className="md:hidden divide-y divide-gray-200">
      {reports.map((report) => (
        <div key={report._id} className="p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-red-600" />
                <span className="font-mono text-sm font-medium text-gray-900">
                  {report._id?.slice(-8).toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-900 mb-2 line-clamp-2">{report.reason}</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600">Reporter:</span>
                  <span className="text-gray-900 font-medium">{report.reporter?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600">Reported:</span>
                  <span className="text-gray-900 font-medium">{report.reportedUser?.name || 'Unknown'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onToggleDropdown(report._id)}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors hover:cursor-pointer"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(report.priority || 'medium')}`}>
              {report.priority || 'medium'}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(report.status)}`}>
              {report.status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(report.createdAt)}</span>
          </div>

          {activeDropdown === report._id && (
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
              <button
                onClick={() => {
                  onViewReport(report);
                  onToggleDropdown(null);
                }}
                className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 hover:cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
              {report.status === 'pending' && (
                <button
                  onClick={() => {
                    onOpenActionModal('reviewed', report);
                    onToggleDropdown(null);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-2 hover:cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Reviewed
                </button>
              )}
              {report.status !== 'resolved' && (
                <button
                  onClick={() => {
                    onOpenActionModal('resolve', report);
                    onToggleDropdown(null);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-2 hover:cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  Resolve Report
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReportsMobileCard;