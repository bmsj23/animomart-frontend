import api from './axios';

// get all conversations
export const getConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

// get unread message count
export const getUnreadCount = async () => {
  const response = await api.get('/messages/unread-count');
  return response.data;
};

// get conversation with specific user
export const getConversation = async (otherUserId) => {
  const response = await api.get(`/messages/${otherUserId}`);
  return response.data;
};

// send new message
export const sendMessage = async (messageData) => {
  const response = await api.post('/messages', messageData);
  return response.data;
};

// mark messages as read
export const markAsRead = async (conversationId) => {
  const response = await api.post('/messages/mark-read', { conversationId });
  return response.data;
};

// delete message
export const deleteMessage = async (messageId) => {
  const response = await api.delete(`/messages/${messageId}`);
  return response.data;
};
