import { ShoppingBag } from 'lucide-react';

const ChatHeader = ({
  conversation,
  isUserOnline,
  getConversationName,
  getUserRole
}) => {
  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
              {getConversationName(conversation).charAt(0).toUpperCase()}
            </div>
            {isUserOnline(conversation._id) && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {getConversationName(conversation)}
            </h3>
            {conversation.product && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <ShoppingBag className="w-3 h-3" />
                {conversation.product.name}
              </p>
            )}
          </div>
        </div>

        {/* role badge */}
        {getUserRole(conversation) && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
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