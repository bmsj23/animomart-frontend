import { useEffect, useState } from 'react';
import * as messageApi from '../api/messages';
import { getSenderId, getRecipientId, calculateConversationId } from '../utils/conversationHelpers';

export const useSocketListeners = (
  socket,
  user,
  selectedConversation,
  setMessages,
  setConversations,
  scrollToBottom
) => {
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (message) => {

      const senderId = getSenderId(message);
      const recipientId = getRecipientId(message);

      if (senderId === user._id) {
        // message sent by me, ignore (optimistic update already added it)
        return;
      }

      // check if this message is for the current user
      const isMessageForMe = recipientId === user._id;

      if (!isMessageForMe) {
        // message not for me, ignore
        return;
      }

      // conversation ID calculation
      const messageConvId = calculateConversationId(senderId, recipientId);

      // Get the other user's ID from the conversation
      const otherUserId = selectedConversation?.otherUserId ||
                         selectedConversation?.otherUser?._id;

      // if message is for current conversation, add it
      if (selectedConversation && senderId === otherUserId) {
        // only add if not already in the list (to avoid duplicates)
        setMessages((prev) => {
          const exists = prev.some(msg => msg._id === message._id || msg._id === message.id);
          if (exists) {
            return prev;
          }
          return [...prev, message];
        });
        scrollToBottom();

        // mark as read and update unread count
        if (selectedConversation.conversationId) {
          messageApi.markAsRead(selectedConversation.conversationId);

          setConversations((prev) =>
            prev.map((conv) =>
              conv._id === selectedConversation.conversationId
                ? { ...conv, unreadCount: 0, lastMessage: message }
                : conv
            )
          );
        }
      } else {
        // message for a different conversation - increment unread count
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === messageConvId
              ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1, lastMessage: message }
              : conv
          )
        );
      }
    };

    // Listen to both event names (backend uses 'messageSent', but keep 'newMessage' for compatibility)
    socket.on('messageSent', handleIncomingMessage);
    socket.on('newMessage', handleIncomingMessage);

    // listen for typing indicator
    socket.on('userTyping', ({ userId, isTyping: typingStatus }) => {
      const otherUserId = selectedConversation?.otherUserId ||
                         selectedConversation?.otherUser?._id;
      if (selectedConversation && userId === otherUserId) {
        setTyping(typingStatus);
      }
    });

    // listen for message deletion
    socket.on('messageDeleted', ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    // listen for messages read event
    socket.on('messagesRead', ({ conversationId }) => {
      // update unread count in conversations list
      if (conversationId) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }

      // update message status to 'read' in current conversation
      if (selectedConversation?.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => {
            const msgSenderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
            if (msgSenderId === user._id) {
              return { ...msg, isRead: true, status: 'read' };
            }
            return msg;
          })
        );
      }
    });

    return () => {
      socket.off('messageSent');
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('messageDeleted');
      socket.off('messagesRead');
    };
  }, [socket, selectedConversation, user._id, setMessages, setConversations, scrollToBottom]);

  return { typing };
};