import { AlertTriangle } from 'lucide-react';
import Modal from '../../common/Modal';

const ReportDetailsModal = ({ report, onClose, formatDate, getStatusColor, getPriorityColor }) => {
  if (!report) return null;

  return (
    <Modal
      isOpen={!!report}
      onClose={onClose}
      title="report details"
    >
      <div className="space-y-4">
        <div className="p-4 bg-red-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="font-semibold text-gray-900">report ID</p>
          </div>
          <p className="font-mono text-sm text-gray-700">{report._id}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">reporter</p>
            <p className="font-semibold text-gray-900">{report.reporter?.name || 'unknown'}</p>
            <p className="text-sm text-gray-600">{report.reporter?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">reported user</p>
            <p className="font-semibold text-gray-900">{report.reportedUser?.name || 'unknown'}</p>
            <p className="text-sm text-gray-600">{report.reportedUser?.email}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600 mb-2">reason</p>
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-gray-900">{report.reason}</p>
          </div>
        </div>

        {report.description && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-2">additional details</p>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-gray-900">{report.description}</p>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">priority</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(report.priority || 'medium')}`}>
                {report.priority || 'medium'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">status</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(report.status)}`}>
                {report.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">reported at</p>
              <p className="font-semibold text-gray-900">{formatDate(report.createdAt)}</p>
            </div>
            {report.resolvedAt && (
              <div>
                <p className="text-sm text-gray-600">resolved at</p>
                <p className="font-semibold text-gray-900">{formatDate(report.resolvedAt)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReportDetailsModal;