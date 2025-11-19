import { useState } from 'react';
import { Eye, CheckCircle } from 'lucide-react';
import Modal from '../../common/Modal';

const ReportActionModal = ({ isOpen, type, onClose, onConfirm }) => {
  const [resolutionText, setResolutionText] = useState('');

  if (!isOpen) return null;

  const config = {
    review: {
      title: 'Mark Report as Reviewed',
      icon: Eye,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      message: 'Mark this report as reviewed? This indicates you have looked into the matter.',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      buttonText: 'Mark as Reviewed',
    },
    resolve: {
      title: 'Resolve Report',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      message: 'Resolve this report and close the case. Provide details about how the issue was resolved.',
      buttonColor: 'bg-green-800 hover:bg-green-700',
      buttonText: 'Resolve Report',
      requiresInput: true
    },
  };

  const currentConfig = config[type];
  if (!currentConfig) return null;

  const Icon = currentConfig.icon;

  const handleConfirm = () => {
    if (currentConfig.requiresInput) {
      onConfirm(resolutionText.trim() || 'resolved by admin');
    } else {
      onConfirm();
    }
    setResolutionText('');
  };

  const handleClose = () => {
    setResolutionText('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={currentConfig.title}
    >
      <div className="space-y-4">
        <div className={`flex items-center gap-3 p-4 ${currentConfig.bgColor} rounded-xl`}>
          <Icon className={`w-5 h-5 ${currentConfig.iconColor} shrink-0`} />
          <p className="text-gray-700">
            {currentConfig.message}
          </p>
        </div>

        {currentConfig.requiresInput && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resolution Message
            </label>
            <textarea
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              placeholder="Describe how the issue was resolved or what action was taken..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              This message will be visible to the user who submitted the report. minimum 10 characters.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-white rounded-xl transition-colors hover:cursor-pointer ${currentConfig.buttonColor}`}
          >
            {currentConfig.buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReportActionModal;