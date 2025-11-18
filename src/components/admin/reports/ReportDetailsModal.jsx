import { AlertTriangle, Package, Store } from 'lucide-react';
import Modal from '../../common/Modal';
import { formatReason } from '../../../utils/formatReason';
import { formatCurrency } from '../../../utils/formatCurrency';

const ReportDetailsModal = ({ report, onClose, formatDate, getStatusColor, getPriorityColor }) => {
  if (!report) return null;

  const product = report.reportedEntity?.entityType === 'product' ? report.reportedEntity.details : null;
  const seller = product?.seller || report.reportedUser;

  return (
    <Modal
      isOpen={!!report}
      onClose={onClose}
      title="Report Details"
      size="xl"
    >
      <div className="space-y-6">
        {/* report id */}
        <div className="p-4 bg-red-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="font-semibold text-gray-900">Report ID</p>
          </div>
          <p className="font-mono text-sm text-gray-700">{report._id}</p>
        </div>

        {/* reporter and reported user */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-600 mb-2">Reporter</p>
            <p className="font-semibold text-gray-900">{report.reporter?.name || 'Unknown'}</p>
            <p className="text-sm text-gray-600 truncate" title={report.reporter?.email}>
              {report.reporter?.email}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-600 mb-2">Reported User</p>
            <p className="font-semibold text-gray-900">{report.reportedUser?.name || 'Unknown'}</p>
            <p className="text-sm text-gray-600 truncate" title={report.reportedUser?.email}>
              {report.reportedUser?.email}
            </p>
          </div>
        </div>

        {/* product details (if applicable) */}
        {product && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-accent" />
              <p className="text-sm font-semibold text-gray-900">Reported Product</p>
            </div>
            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
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

        {/* seller details */}
        {seller && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Store className="w-5 h-5 text-accent" />
              <p className="text-sm font-semibold text-gray-900">Seller Information</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
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

        {/* reason */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-600 mb-2">Reason</p>
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-gray-900 font-medium">{formatReason(report.reason)}</p>
          </div>
        </div>

        {/* description */}
        {report.description && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Additional Details</p>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-gray-900 whitespace-pre-line">{report.description}</p>
            </div>
          </div>
        )}

        {/* status and dates */}
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Priority</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(report.priority || 'medium')}`}>
                {(report.priority || 'medium').toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(report.status)}`}>
                {report.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Reported At</p>
              <p className="font-semibold text-gray-900">{formatDate(report.createdAt)}</p>
            </div>
            {report.resolvedAt && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Resolved At</p>
                <p className="font-semibold text-gray-900">{formatDate(report.resolvedAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* resolution */}
        {report.resolution && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Resolution</p>
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-gray-900">{report.resolution}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ReportDetailsModal;