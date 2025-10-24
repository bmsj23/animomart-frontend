import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';

const MessageInput = ({
  messageText,
  setMessageText,
  imagePreviews,
  onImageSelect,
  onRemoveImage,
  onSubmit,
  sending,
  onTyping
}) => {
  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      {/* image previews */}
      {imagePreviews.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative flex-shrink-0">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <button
                onClick={() => onRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex items-end gap-2">
        {/* image upload */}
        <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ImageIcon className="w-5 h-5 text-gray-600" />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onImageSelect}
            className="hidden"
            disabled={sending}
          />
        </label>

        {/* text input */}
        <input
          type="text"
          value={messageText}
          onChange={(e) => {
            setMessageText(e.target.value);
            onTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          disabled={sending}
        />

        {/* send button */}
        <button
          type="submit"
          disabled={sending || (!messageText.trim() && imagePreviews.length === 0)}
          className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;