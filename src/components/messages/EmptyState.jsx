const EmptyState = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <img src="/assets/Message.png" alt="Messages" className="mx-auto mb-4 w-40 h-40 md:w-48 md:h-48 object-contain" />
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