import { useState } from 'react';
import { X, AlertTriangle, Upload } from 'lucide-react';
import Button from './Button';
import { createReport } from '../../api/reports';
import { useToast } from '../../hooks/useToast';

const REPORT_REASONS = [
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'spam', label: 'Spam' },
  { value: 'scam_or_fraud', label: 'Scam or Fraud' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'counterfeit_product', label: 'Counterfeit Product' },
  { value: 'other', label: 'Other' },
];

const ReportModal = ({ isOpen, onClose, entityType, entityId, entityName }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      error('Please select a reason');
      return;
    }

    if (description.length < 20) {
      error('Description must be at least 20 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReport({
        entityType,
        entityId,
        reason,
        description,
      });

      success('Report submitted successfully');
      handleClose();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-semibold">Report {entityType.charAt(0).toUpperCase() + entityType.slice(1)}</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* entity info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              Reporting: <span className="font-medium text-gray-900">{entityName}</span>
            </p>
          </div>

          {/* reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for report <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent hover:cursor-pointer"
              required
            >
              <option value="">Select a reason</option>
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about your report (minimum 20 characters)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent resize-none"
              rows={5}
              minLength={20}
              maxLength={1000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/1000 characters (minimum 20)
            </p>
          </div>

          {/* warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              Please ensure your report is accurate. False reports may result in action against your account.
            </p>
          </div>

          {/* actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 hover:cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="flex-1 hover:cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;