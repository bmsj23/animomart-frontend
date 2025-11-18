import { ShoppingBag, ArrowLeft } from 'lucide-react';
import ProfileAvatar from '../common/ProfileAvatar';

const ChatHeader = ({
  conversation,
  isUserOnline,
  getConversationName,
  getUserRole,
  onBack
}) => {
  return (
    <div className="p-3 sm:p-4 border-b border-gray-200 bg-white shrink-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* back button for mobile */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}

          <div className="relative shrink-0">
            <ProfileAvatar user={conversation.otherUser} size="sm" />
            {isUserOnline(conversation._id) && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
              {getConversationName(conversation)}
            </h3>
            {conversation.product && (
              <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                <ShoppingBag className="w-3 h-3 shrink-0" />
                <span className="truncate">{conversation.product.name}</span>
              </p>
            )}
          </div>
        </div>

        {/* role badge */}
        {getUserRole(conversation) && (
          <div className={`hidden sm:block px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${
            getUserRole(conversation) === 'Seller'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}>
            You are the {getUserRole(conversation)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;