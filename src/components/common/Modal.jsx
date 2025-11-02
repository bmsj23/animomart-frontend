import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  icon,
  iconBgColor = 'bg-red-100',
  iconColor = 'text-red-600',
  size = 'md',
  actions,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return createPortal(
    <div className="fixed inset-0 overflow-y-auto z-41">
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-all"
        onClick={onClose}
      />

      {/* modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative bg-white rounded-xl shadow-2xl w-full ${sizes[size]} transform transition-all animate-fade-in`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* x button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors hover:cursor-pointer z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-6">
            {/* header with icon, title, description - all stacked vertically */}
            {(icon || title || description) && (
              <div className="mb-6">
                {icon && (
                  <div className="flex justify-center mb-4">
                    <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center`}>
                      <div className={iconColor}>
                        {icon}
                      </div>
                    </div>
                  </div>
                )}
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-sm text-gray-600 text-center">
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* content */}
            {children && (
              <div className="mb-6">
                {children}
              </div>
            )}

            {/* actions */}
            {actions && (
              <div className="flex gap-3 justify-end">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;