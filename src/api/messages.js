import api from './axios';

// get all conversations
export const getConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

// get conversation with specific user
export const getConversation = async (userId) => {
  const response = await api.get(`/messages/conversations/${userId}`);
  return response.data;
};

// send new message
export const sendMessage = async (messageData) => {
  const response = await api.post('/messages', messageData);
  return response.data;
};

// delete message
export const deleteMessage = async (id) => {
  const response = await api.delete(`/messages/${id}`);
  return response.data;
};

// mark messages as read
export const markAsRead = async (conversationId) => {
  const response = await api.put(`/messages/conversations/${conversationId}/read`);
  return response.data;
};
