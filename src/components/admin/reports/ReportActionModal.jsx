import { Eye, CheckCircle } from 'lucide-react';
import Modal from '../../common/Modal';

const ReportActionModal = ({ isOpen, type, onClose, onConfirm }) => {
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
      message: 'Resolve this report? This indicates the issue has been addressed and closed.',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      buttonText: 'Resolve Report',
    },
  };

  const currentConfig = config[type];
  if (!currentConfig) return null;

  const Icon = currentConfig.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentConfig.title}
    >
      <div className="space-y-4">
        <div className={`flex items-center gap-3 p-4 ${currentConfig.bgColor} rounded-xl`}>
          <Icon className={`w-5 h-5 ${currentConfig.iconColor} shrink-0`} />
          <p className="text-gray-700">
            {currentConfig.message}
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
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