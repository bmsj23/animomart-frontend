// utility functions for conversation formatting and helpers

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
};

export const formatDate = (date) => {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }
};

export const getConversationName = (conversation) => {
  return conversation.name ||
         conversation.otherUser?.name ||
         conversation.otherUser?.username ||
         'Unknown User';
};

export const getUserRole = (conversation, currentUserId) => {

  // determine if user is buyer or seller in this conversation
  if (conversation.product) {
    const sellerId = typeof conversation.product.seller === 'object'
      ? conversation.product.seller?._id
      : conversation.product.seller;
    const isSeller = sellerId === currentUserId;
    return isSeller ? 'Seller' : 'Buyer';
  }
  return null;
};

export const calculateConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

export const extractOtherUserId = (conversationId, currentUserId) => {
  const [user1Id, user2Id] = conversationId.split('_');
  return user1Id === currentUserId ? user2Id : user1Id;
};

export const shouldShowDateSeparator = (messages, index) => {
  if (index === 0) return true;
  return formatDate(messages[index - 1].createdAt) !== formatDate(messages[index].createdAt);
};

export const isMessageGrouped = (messages, index) => {
  if (index === 0) return false;

  const message = messages[index];
  const prevMessage = messages[index - 1];

  const senderId = typeof message.sender === 'object'
    ? message.sender?._id
    : message.sender;

  const prevSenderId = typeof prevMessage.sender === 'object'
    ? prevMessage.sender?._id
    : prevMessage.sender;

  const showDate = shouldShowDateSeparator(messages, index);

  // group if same sender, no date separator, and within 2 minutes
  return prevSenderId === senderId &&
         !showDate &&
         (new Date(message.createdAt) - new Date(prevMessage.createdAt)) < 120000;
};

export const getSenderId = (message) => {
  return typeof message.sender === 'object'
    ? message.sender?._id || message.sender?.id
    : message.sender;
};

export const getRecipientId = (message) => {
  return typeof message.recipient === 'object'
    ? message.recipient?._id || message.recipient?.id
    : message.recipient;
};