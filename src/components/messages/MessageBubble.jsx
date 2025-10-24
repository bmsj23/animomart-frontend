const MessageBubble = ({
  message,
  isOwnMessage,
  onDelete,
  formatTime
}) => {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
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

          {/* text content */}
          {message.content && (
            <p className="break-words">{message.content}</p>
          )}

          {/* timestamp */}
          <p
            className={`text-xs mt-1 ${
              isOwnMessage ? 'text-green-100' : 'text-gray-500'
            }`}
          >
            {formatTime(message.createdAt)}
            {message.isRead && isOwnMessage && (
              <span className="ml-1">✓✓</span>
            )}
          </p>
        </div>

        {/* delete button for own messages */}
        {isOwnMessage && (
          <button
            onClick={() => onDelete(message._id)}
            className="text-xs text-gray-400 hover:text-red-600 mt-1"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;