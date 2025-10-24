import { Send } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Select a conversation
        </h3>
        <p className="text-gray-500">
          Choose a conversation from the list to start messaging
        </p>
      </div>
    </div>
  );
};

export default EmptyState;