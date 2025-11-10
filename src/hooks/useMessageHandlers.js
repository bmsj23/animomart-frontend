import { useState, useRef, useCallback } from 'react';
import * as messageApi from '../api/messages';
import { uploadMultipleImages } from '../api/upload';
import { logger } from '../utils/logger';

export const useMessageHandlers = (socket, user, selectedConversation, setMessages) => {
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleImageSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 5) {
      throw new Error('You can only upload up to 5 images');
    }

    setSelectedImages(prev => [...prev, ...files]);

    // create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  }, [selectedImages.length]);

  const removeImage = useCallback((index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();

    if (!messageText.trim() && selectedImages.length === 0) return;
    if (!selectedConversation) return;

    try {
      setSending(true);

      // create optimistic message which is shown immediately
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        _id: tempId,
        sender: user._id,
        recipient: selectedConversation.otherUserId || selectedConversation.otherUser?._id,
        messageText: messageText.trim(),
        createdAt: new Date().toISOString(),
        isRead: false,
        status: 'sending'
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      // clear input immediately for better ux
      const messageToSend = messageText.trim();
      const imagesToUpload = [...selectedImages];
      setMessageText('');
      setSelectedImages([]);
      setImagePreviews([]);
      scrollToBottom();

      let imageUrls = [];

      // upload images if any
      if (imagesToUpload.length > 0) {
        const uploadResponse = await uploadMultipleImages(imagesToUpload);
        imageUrls = uploadResponse.data.map((img) => img.url);
      }

      // send message
      const recipientId = selectedConversation.otherUserId ||
                         selectedConversation.otherUser?._id ||
                         selectedConversation._id;

      const messageData = {
        recipient: recipientId,
        messageText: messageToSend,
        ...(imageUrls.length > 0 && { image: imageUrls[0] }),
        ...(selectedConversation.product && { product: selectedConversation.product._id })
      };

      // add conversationId only if this is an existing conversation
      if (selectedConversation.conversationId) {
        messageData.conversationId = selectedConversation.conversationId;
      }

      logger.log('Sending message with data:', messageData);
      const response = await messageApi.sendMessage(messageData);
      const messageFromResponse = response.data?.message || response.data;

      // replace optimistic message with real message from server
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === tempId) {
            // check if message is already read
            if (messageFromResponse.isRead) {
              return { ...messageFromResponse, status: 'read' };
            }
            return { ...messageFromResponse, status: 'sent' };
          }
          return msg;
        })
      );

      // emit socket event
      if (socket) {
        socket.emit('sendMessage', messageFromResponse);
      }

      scrollToBottom();

    } catch (err) {
      logger.error('Failed to send message:', err);

      // remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.status !== 'sending'));
      throw err;
    } finally {
      setSending(false);
    }
  }, [messageText, selectedImages, selectedConversation, user._id, socket, setMessages, scrollToBottom]);

  const handleTyping = useCallback(() => {
    if (!socket || !selectedConversation) return;

    // emit typing event
    socket.emit('typing', {
      to: selectedConversation._id,
      isTyping: true
    });

    // clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        to: selectedConversation._id,
        isTyping: false
      });
    }, 1000);
  }, [socket, selectedConversation]);

  const handleDeleteMessage = useCallback(async (messageId) => {
    try {
      await messageApi.deleteMessage(messageId);

      // emit socket event
      if (socket) {
        socket.emit('deleteMessage', { messageId });
      }

      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      return true;
    } catch (err) {
      logger.error('Failed to delete message:', err);
      throw err;
    }
  }, [socket, setMessages]);

  const clearInput = useCallback(() => {
    setMessageText('');
    setSelectedImages([]);
    setImagePreviews([]);
  }, []);

  return {
    messageText,
    setMessageText,
    sending,
    selectedImages,
    imagePreviews,
    messagesEndRef,
    handleImageSelect,
    removeImage,
    handleSendMessage,
    handleTyping,
    handleDeleteMessage,
    scrollToBottom,
    clearInput
  };
};