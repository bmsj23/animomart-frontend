import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../hooks/useToast';
import { useConversations } from '../hooks/useConversations';
import { useMessageHandlers } from '../hooks/useMessageHandlers';
import { useSocketListeners } from '../hooks/useSocketListeners';
import * as messageApi from '../api/messages';
import ConversationList from '../components/messages/ConversationList';
import ChatHeader from '../components/messages/ChatHeader';
import MessageBubble from '../components/messages/MessageBubble';
import MessageInput from '../components/messages/MessageInput';
import TypingIndicator from '../components/messages/TypingIndicator';
import EmptyState from '../components/messages/EmptyState';
import {
  formatTime,
  formatDate,
  getConversationName,
  getUserRole
} from '../utils/conversationHelpers';
import { logger } from '../utils/logger';

const Messages = () => {
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();
  const { error: showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const {
    conversations,
    setConversations,
    loading,
    fetchConversations,
    createNewConversation
  } = useConversations(user._id);

  const {
    messageText,
    setMessageText,
    imagePreviews,
    messagesEndRef,
    handleImageSelect,
    removeImage,
    handleSendMessage,
    handleTyping,
    handleDeleteMessage,
    scrollToBottom,
    clearInput
  } = useMessageHandlers(socket, user, selectedConversation, setMessages);

  const { typing } = useSocketListeners(
    socket,
    user,
    selectedConversation,
    setMessages,
    setConversations,
    scrollToBottom
  );

  // fetch conversations on mount
  useEffect(() => {
    fetchConversations().catch(() => {
      showError('Failed to load conversations');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handle query parameters (user & product from URL)
  useEffect(() => {
    const userId = searchParams.get('user');
    const productId = searchParams.get('product');

    if (userId && !loading) {
      logger.log('Processing query params:', { userId, productId });
      logger.log('Current conversations:', conversations);

      // find existing conversation with this user
      const existingConversation = conversations.find(
        (conv) => conv._id === userId || conv.otherUser?._id === userId
      );

      if (existingConversation) {
        logger.log('Found existing conversation:', existingConversation);
        // select the existing conversation
        handleSelectConversation(existingConversation);
      } else {
        logger.log('Creating new conversation with user:', userId);
        // create a new conversation object for this user
        createNewConversation(userId, productId).then((newConversation) => {
          if (newConversation) {
            handleSelectConversation(newConversation);
          }
        }).catch((err) => {
          logger.error('Failed to create conversation:', err);
          showError('Failed to open conversation');
        });
      }

      // clear query params after handling
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, conversations, loading]);

  // join/leave conversation when a conversation from the list is clicked
  useEffect(() => {
    if (!socket || !selectedConversation?.conversationId) return;

    socket.emit('joinConversation', {
      conversationId: selectedConversation.conversationId
    });

    // leave conversation when component unmounts or conversation changes
    return () => {
      socket.emit('leaveConversation', {
        conversationId: selectedConversation.conversationId
      });
    };
  }, [socket, selectedConversation?.conversationId]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, messagesEndRef]);

  const fetchMessages = async (otherUserId, conversationId) => {
    try {
      logger.log('Fetching messages for user:', otherUserId);
      const response = await messageApi.getConversation(otherUserId);
      logger.log('Fetched messages response:', response.data);
      const fetchedMessages = response.data.messages || response.data || [];

      const sortedMessages = [...fetchedMessages].sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt)
      );

      logger.log('Setting messages:', sortedMessages);
      setMessages(sortedMessages);

      if (conversationId) {
        await messageApi.markAsRead(conversationId);

        if (socket) {
          socket.emit('markAsRead', { conversationId });
        }

        // then, update local state immediately
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }
    } catch (err) {
      logger.error('Failed to fetch messages:', err);
      showError('Failed to load messages');
    }
  };

  const handleSelectConversation = (conversation) => {
    logger.log('Selected conversation:', conversation);

    const conversationId = conversation._id;
    const [user1Id, user2Id] = conversationId.split('_');
    const otherUserId = user1Id === user._id ? user2Id : user1Id;

    logger.log('Current user ID:', user._id);
    logger.log('Other user ID:', otherUserId);

    const updatedConversation = {
      ...conversation,
      conversationId: conversationId,
      otherUserId: otherUserId
    };

    setSelectedConversation(updatedConversation);

    fetchMessages(otherUserId, conversationId);

    clearInput();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 md:top-20 flex flex-col bg-gray-50">
      {/* main container */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 flex overflow-hidden">
          <div className="w-full flex md:rounded-lg md:shadow-lg overflow-hidden bg-white">

          {/* left: conversations list */}
          <div className={`${
            selectedConversation ? 'hidden md:flex' : 'flex'
          } w-full md:w-[380px] flex-col border-r border-gray-200`}>

            {/* conversations header */}
            <div className="h-[73px] shrink-0 p-4 border-b border-gray-200 bg-white flex items-center">
              <h2 className="font-semibold text-gray-900">Conversations</h2>
            </div>

            {/* conversations list */}
            <div className="flex-1 overflow-y-auto">
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                isUserOnline={isUserOnline}
                getConversationName={getConversationName}
                getUserRole={getUserRole}
              />
            </div>
          </div>

          {/* right: chat panel */}
          <div className={`${
            selectedConversation ? 'flex' : 'hidden md:flex'
          } flex-1 flex-col`}>
              {selectedConversation ? (
                <>
                  {/* chat header - fixed at top */}
                  <ChatHeader
                    conversation={selectedConversation}
                    isUserOnline={isUserOnline}
                    getConversationName={getConversationName}
                    getUserRole={getUserRole}
                    onBack={() => setSelectedConversation(null)}
                  />

                  {/* messages area - scrollable, takes all available space */}
                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 min-h-0">
                    {messages.map((message, index) => {
                      const senderId = typeof message.sender === 'object'
                        ? message.sender?._id
                        : message.sender;
                      const isOwnMessage = senderId === user._id;

                      const showDate = index === 0 ||
                        formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                      const prevMessage = messages[index - 1];
                      const prevSenderId = prevMessage && typeof prevMessage.sender === 'object'
                        ? prevMessage.sender?._id
                        : prevMessage?.sender;

                      const isGrouped = prevMessage &&
                        prevSenderId === senderId &&
                        !showDate &&
                        (new Date(message.createdAt) - new Date(prevMessage.createdAt)) < 120000; // 2 minutes

                      return (
                        <div key={message._id} className={isGrouped ? 'mt-1' : 'mt-4'}>
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
                            isGrouped={isGrouped}
                          />
                        </div>
                      );
                    })}

                    {/* typing indicator */}
                    {typing && <TypingIndicator />}

                    {/* scroll anchor */}
                    <div ref={messagesEndRef} />
                  </div>

                {/* message input */}
                <div className="shrink-0">
                  <MessageInput
                    messageText={messageText}
                    setMessageText={setMessageText}
                    imagePreviews={imagePreviews}
                    onImageSelect={handleImageSelect}
                    onRemoveImage={removeImage}
                    onSubmit={handleSendMessage}
                    onTyping={handleTyping}
                  />
                </div>
              </>
            ) : (
              <EmptyState />
            )}
          </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;