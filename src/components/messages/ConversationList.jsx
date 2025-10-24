import { ShoppingBag, User } from 'lucide-react';

const ConversationList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  isUserOnline,
  getConversationName,
  getUserRole
}) => {
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No conversations yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Start messaging from product pages
        </p>
      </div>
    );
  }

  return (
    <div>
      {conversations.map((conversation) => (
        <div
          key={conversation._id}
          onClick={() => onSelectConversation(conversation)}
          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedConversation?._id === conversation._id ? 'bg-green-50' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            {/* avatar */}
            <div className="relative">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                {getConversationName(conversation).charAt(0).toUpperCase()}
              </div>
              {isUserOnline(conversation._id) && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            {/* conversation info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {getConversationName(conversation)}
                </h3>
                {conversation.unreadCount > 0 && (
                  <span className="bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>

              {/* product info if exists */}
              {conversation.product && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <ShoppingBag className="w-3 h-3" />
                  <span className="truncate">{conversation.product.name}</span>
                </div>
              )}

              {/* user role badge */}
              {getUserRole(conversation) && (
                <div className="flex items-center gap-1 text-xs">
                  <User className="w-3 h-3 text-gray-400" />
                  <span className={`font-medium ${
                    getUserRole(conversation) === 'Seller' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {getUserRole(conversation)}
                  </span>
                </div>
              )}

              {/* last message */}
              {conversation.lastMessage && (
                <p className="text-sm text-gray-500 truncate">
                  {conversation.lastMessage.content ||
                   conversation.lastMessage.messageText ||
                   conversation.lastMessage.text ||
                   (conversation.lastMessage.image ? 'Image' : 'Sent an image')}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;