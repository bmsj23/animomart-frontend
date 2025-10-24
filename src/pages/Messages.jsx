import { useState, useEffect, useRef } from 'react';
import { Circle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../hooks/useToast';
import * as messageApi from '../api/messages';
import { uploadMultipleImages } from '../api/upload';
import ConversationList from '../components/messages/ConversationList';
import ChatHeader from '../components/messages/ChatHeader';
import MessageBubble from '../components/messages/MessageBubble';
import MessageInput from '../components/messages/MessageInput';
import TypingIndicator from '../components/messages/TypingIndicator';
import EmptyState from '../components/messages/EmptyState';

const Messages = () => {
  const { user } = useAuth();
  const { socket, isConnected, isUserOnline } = useSocket();
  const { success, error: showError } = useToast();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // fetch conversations on mount
  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // socket event listeners
  useEffect(() => {
    if (!socket) return;

    // listen for new messages
    socket.on('newMessage', (message) => {
      // if message is for current conversation, add it
      if (selectedConversation &&
          (message.sender === selectedConversation._id || message.receiver === selectedConversation._id)) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();

        // mark as read
        if (message.sender === selectedConversation._id) {
          messageApi.markAsRead(selectedConversation._id);
        }
      }

      // update conversations list
      fetchConversations();
    });

    // listen for typing indicator
    socket.on('userTyping', ({ userId, isTyping }) => {
      if (selectedConversation && userId === selectedConversation._id) {
        setTyping(isTyping);
      }
    });

    // listen for message deletion
    socket.on('messageDeleted', ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    return () => {
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('messageDeleted');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, selectedConversation]);

  // scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageApi.getConversations();
      setConversations(response.data || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      showError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const response = await messageApi.getConversation(otherUserId);
      setMessages(response.data.messages || []);

      // mark as read
      await messageApi.markAsRead(otherUserId);
      fetchConversations(); // refresh to update unread count
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      showError('Failed to load messages');
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation._id);
    setMessageText('');
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 5) {
      showError('You can only upload up to 5 images');
      return;
    }

    setSelectedImages([...selectedImages, ...files]);

    // create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() && selectedImages.length === 0) return;
    if (!selectedConversation) return;

    try {
      setSending(true);
      let imageUrls = [];

      // upload images if any
      if (selectedImages.length > 0) {
        const uploadResponse = await uploadMultipleImages(selectedImages);
        imageUrls = uploadResponse.data.map((img) => img.url);
      }

      // send message
      const messageData = {
        receiver: selectedConversation._id,
        content: messageText.trim(),
        ...(imageUrls.length > 0 && { images: imageUrls })
      };

      const response = await messageApi.sendMessage(messageData);

      // emit socket event
      if (socket) {
        socket.emit('sendMessage', response.data);
      }

      // add to messages list
      setMessages((prev) => [...prev, response.data]);
      setMessageText('');
      setSelectedImages([]);
      setImagePreviews([]);
      scrollToBottom();

      // update conversations
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
      showError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
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
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await messageApi.deleteMessage(messageId);

      // emit socket event
      if (socket) {
        socket.emit('deleteMessage', { messageId });
      }

      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      success('Message deleted');
    } catch (err) {
      console.error('Failed to delete message:', err);
      showError('Failed to delete message');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
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

  const getConversationName = (conversation) => {
    return conversation.name || 'Unknown User';
  };

  const getUserRole = (conversation) => {
    // determine if user is buyer or seller in this conversation
    if (conversation.product) {
      const isSeller = conversation.product.seller === user._id;
      return isSeller ? 'Seller' : 'Buyer';
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <div className="flex items-center gap-2">
          <Circle className={`w-3 h-3 ${isConnected ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-250px)]">
          {/* conversations list */}
          <div className="border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Conversations</h2>
            </div>
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              isUserOnline={isUserOnline}
              getConversationName={getConversationName}
              getUserRole={getUserRole}
            />
          </div>

          {/* chat area */}
          <div className="col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* chat header */}
                <ChatHeader
                  conversation={selectedConversation}
                  isUserOnline={isUserOnline}
                  getConversationName={getConversationName}
                  getUserRole={getUserRole}
                />

                {/* messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message, index) => {
                    const isOwnMessage = message.sender === user._id;
                    const showDate = index === 0 ||
                      formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                    return (
                      <div key={message._id}>
                        {/* date separator */}
                        {showDate && (
                          <div className="flex items-center justify-center my-4">
                            <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                        )}

                        <MessageBubble
                          message={message}
                          isOwnMessage={isOwnMessage}
                          onDelete={handleDeleteMessage}
                          formatTime={formatTime}
                        />
                      </div>
                    );
                  })}

                  {/* typing indicator */}
                  {typing && <TypingIndicator />}

                  <div ref={messagesEndRef} />
                </div>

                {/* message input */}
                <MessageInput
                  messageText={messageText}
                  setMessageText={setMessageText}
                  imagePreviews={imagePreviews}
                  onImageSelect={handleImageSelect}
                  onRemoveImage={removeImage}
                  onSubmit={handleSendMessage}
                  sending={sending}
                  onTyping={handleTyping}
                />
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
