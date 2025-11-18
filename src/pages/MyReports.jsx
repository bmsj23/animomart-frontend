import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, X, Package, Store, Eye } from 'lucide-react';
import { getMyReports } from '../api/reports';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/formatDate';
import { formatReason } from '../utils/formatReason';
import { formatCurrency } from '../utils/formatCurrency';
import LoadingSpinner from '../components/common/LoadingSpinner';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  under_review: {
    label: 'Under Review',
    icon: Eye,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  dismissed: {
    label: 'Dismissed',
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
};

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const { error } = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const params = statusFilter ? { status: statusFilter } : {};
        const response = await getMyReports(params);
        setReports(response.data.reports || []);
      } catch (err) {
        error(err.response?.data?.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [statusFilter, error]);

  const ReportCard = ({ report }) => {
    const statusConfig = STATUS_CONFIG[report.status];
    const StatusIcon = statusConfig.icon;

    return (
      <div
        onClick={() => setSelectedReport(report)}
        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow hover:cursor-pointer"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500 uppercase">
                  {report.reportedEntity.entityType}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {formatReason(report.reason)}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {report.description}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
            <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
            <span className={`text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Submitted {formatDate(report.createdAt)}
          </p>

          {report.reviewedAt && (
            <p className="text-xs text-gray-500">
              Reviewed {formatDate(report.reviewedAt)}
            </p>
          )}
        </div>

        {(report.resolution || report.adminNotes) && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-1">
              {report.resolution ? 'Resolution' : 'Admin Notes'}
            </p>
            <p className="text-sm text-gray-600">
              {report.resolution || report.adminNotes}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
          </div>
          <p className="text-gray-600">
            Track the status of your submitted reports
          </p>
        </div>

        {/* filters */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent hover:cursor-pointer"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        {/* reports list */}
        {reports.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No reports found
            </h3>
            <p className="text-gray-600">
              {statusFilter
                ? 'No reports with this status'
                : "You haven't submitted any reports yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <ReportCard key={report._id} report={report} />
            ))}
          </div>
        )}
      </div>

      {/* report detail modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
};

const ReportDetailModal = ({ report, onClose }) => {
  if (!report) return null;

  const statusConfig = STATUS_CONFIG[report.status];
  const StatusIcon = statusConfig.icon;
  const product = report.reportedEntity?.entityType === 'product' ? report.reportedEntity.details : null;
  const seller = product?.seller || report.reportedUser;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white border-gray-100">
          <h2 className="text-xl font-semibold">Report Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* content */}
        <div className="p-6 space-y-6">
          {/* status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
              <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
              <span className={`text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* product details */}
          {product && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-gray-700">Reported Product</span>
              </div>
              <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-accent font-bold">{formatCurrency(product.price)}</p>
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* seller information */}
          {seller && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Store className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-gray-700">Seller Information</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name</span>
                  <span className="font-medium text-gray-900">{seller.name || 'Unknown'}</span>
                </div>
                {seller.email && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email</span>
                    <span className="font-medium text-gray-900 truncate ml-4" title={seller.email}>
                      {seller.email}
                    </span>
                  </div>
                )}
                {seller.shopName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Shop Name</span>
                    <span className="font-medium text-gray-900">{seller.shopName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* reported entity (fallback if not product) */}
          {!product && (
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-2">Reported Entity</span>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Type:</span> {report.reportedEntity.entityType}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ID: {report.reportedEntity.entityId}
                </p>
              </div>
            </div>
          )}

          {/* reason */}
          <div>
            <span className="text-sm font-medium text-gray-700 block mb-2">Reason</span>
            <p className="text-sm text-gray-900 font-medium">
              {formatReason(report.reason)}
            </p>
          </div>

          {/* description */}
          <div>
            <span className="text-sm font-medium text-gray-700 block mb-2">Description</span>
            <p className="text-sm text-gray-900 whitespace-pre-line">
              {report.description}
            </p>
          </div>

          {/* dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-2">Submitted</span>
              <p className="text-sm text-gray-900">{formatDate(report.createdAt)}</p>
            </div>
            {report.reviewedAt && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">Reviewed</span>
                <p className="text-sm text-gray-900">{formatDate(report.reviewedAt)}</p>
              </div>
            )}
          </div>

          {/* admin notes */}
          {report.adminNotes && (
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-2">Admin Notes</span>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-900">{report.adminNotes}</p>
              </div>
            </div>
          )}

          {/* resolution */}
          {report.resolution && (
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-2">Resolution</span>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-900">{report.resolution}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReports;