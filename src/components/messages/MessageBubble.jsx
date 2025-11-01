import { MoreVertical, Check, CheckCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const MessageBubble = ({
  message,
  isOwnMessage,
  onDelete,
  formatTime,
  isGrouped = false
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // determine message status with priority
  const getMessageStatus = () => {
    if (message.status === 'sending') return 'sending';
    if (message.status === 'read' || message.isRead) return 'read';
    if (message.status === 'sent') return 'sent';
    return 'sent';
  };

  const messageStatus = getMessageStatus();

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'} relative`}>
        {/* 3-dot menu button */}
        {isOwnMessage && (
          <div ref={menuRef} className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors hover:cursor-pointer"
              aria-label="Message options"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onDelete(message._id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        <div
          className={`rounded-2xl px-3 sm:px-4 py-2 ${
            isOwnMessage
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-900 shadow-sm'
          }`}
        >
          {/* images */}
          {message.images && message.images.length > 0 && (
            <div className="mb-2 space-y-2">
              {message.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="Sent image"
                  className="rounded-lg max-w-full cursor-pointer hover:opacity-90"
                  onClick={() => window.open(img, '_blank')}
                />
              ))}
            </div>
          )}

          {/* single image */}
          {message.image && !message.images && (
            <div className="mb-2">
              <img
                src={message.image}
                alt="Sent image"
                className="rounded-lg max-w-full cursor-pointer hover:opacity-90"
                onClick={() => window.open(message.image, '_blank')}
              />
            </div>
          )}

          {/* text content */}
          {(message.content || message.messageText || message.text) && (
            <p className="wrap-break-word text-sm sm:text-base">
              {message.content || message.messageText || message.text}
            </p>
          )}

          {/* timestamp and status */}
          <div className={`flex items-center justify-end gap-1 mt-1 ${isGrouped ? 'opacity-100 transition-opacity' : ''}`}>
            <p
              className={`text-xs ${
                isOwnMessage ? 'text-green-100' : 'text-gray-500'
              }`}
            >
              {formatTime(message.createdAt)}
            </p>

            {/* status indicators for own messages */}
            {isOwnMessage && (
              <span className="text-xs text-green-100 flex items-center">
                {messageStatus === 'sending' && '○'}
                {messageStatus === 'sent' && <Check className="w-4 h-4" />}
                {messageStatus === 'read' && <CheckCheck className="w-4 h-4" />}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;