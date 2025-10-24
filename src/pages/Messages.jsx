import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Circle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../hooks/useToast';
import * as messageApi from '../api/messages';
import { uploadMultipleImages } from '../api/upload';
import { getProduct } from '../api/products';
import { getUserProfile } from '../api/users';
import ConversationList from '../components/messages/ConversationList';
import ChatHeader from '../components/messages/ChatHeader';
import MessageBubble from '../components/messages/MessageBubble';
import MessageInput from '../components/messages/MessageInput';
import TypingIndicator from '../components/messages/TypingIndicator';
import EmptyState from '../components/messages/EmptyState';

const Messages = () => {
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();
  const { success, error: showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [userCache, setUserCache] = useState({}); // Cache user info by ID

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // fetch conversations on mount
  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handle query parameters (user & product from URL)
  useEffect(() => {
    const userId = searchParams.get('user');
    const productId = searchParams.get('product');

    if (userId && !loading) {
      console.log('Processing query params:', { userId, productId });
      console.log('Current conversations:', conversations);

      // find existing conversation with this user
      const existingConversation = conversations.find(
        (conv) => conv._id === userId || conv.otherUser?._id === userId
      );

      if (existingConversation) {
        console.log('Found existing conversation:', existingConversation);
        // select the existing conversation
        handleSelectConversation(existingConversation);
      } else {
        console.log('Creating new conversation with user:', userId);
        // create a new conversation object for this user
        createNewConversation(userId, productId);
      }

      // clear query params after handling
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, conversations, loading]);

  // socket event listeners
  useEffect(() => {
    if (!socket) return;

    // listen for new messages
    socket.on('newMessage', (message) => {
      console.log('Received new message via socket:', message);

      // Get the other user's ID from the conversation
      const otherUserId = selectedConversation?.otherUserId ||
                         selectedConversation?.otherUser?._id;

      // Get sender ID (handle both object and string)
      const senderId = typeof message.sender === 'object' ? message.sender?._id : message.sender;
      const receiverId = typeof message.receiver === 'object' ? message.receiver?._id : message.receiver;

      // if message is for current conversation, add it
      if (selectedConversation && (senderId === otherUserId || receiverId === otherUserId)) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();

        // mark as read if from other user and update unread count
        if (senderId === otherUserId && selectedConversation.conversationId) {
          messageApi.markAsRead(selectedConversation.conversationId);

          setConversations((prev) =>
            prev.map((conv) =>
              conv._id === selectedConversation.conversationId
                ? { ...conv, unreadCount: 0 }
                : conv
            )
          );
        }
      } else {
        // message for a different conversation - increment unread count
        const messageConvId = `${Math.min(senderId, receiverId)}_${Math.max(senderId, receiverId)}`;
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === messageConvId
              ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1, lastMessage: message }
              : conv
          )
        );
      }
    });

    // listen for typing indicator
    socket.on('userTyping', ({ userId, isTyping }) => {
      const otherUserId = selectedConversation?.otherUserId ||
                         selectedConversation?.otherUser?._id;
      if (selectedConversation && userId === otherUserId) {
        setTyping(isTyping);
      }
    });

    // listen for message deletion
    socket.on('messageDeleted', ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    // listen for messages read event
    socket.on('messagesRead', ({ readBy, conversationId }) => {
      console.log('Messages marked as read by:', readBy, 'for conversation:', conversationId);

      if (conversationId) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }
    });

    return () => {
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('messageDeleted');
      socket.off('messagesRead');
    };
  }, [socket, selectedConversation]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageApi.getConversations();
      console.log('Fetched conversations:', response.data);

      const enrichedConversations = await Promise.all(
        (response.data || []).map(async (conv) => {
          const [user1Id, user2Id] = conv._id.split('_');
          const otherUserId = user1Id === user._id ? user2Id : user1Id;

          let otherUser = userCache[otherUserId];

          if (!otherUser) {
            try {

              const userResponse = await getUserProfile(otherUserId);
              otherUser = userResponse.data;
            } catch (err) {
              console.error('Failed to fetch user:', otherUserId, err);
              otherUser = { _id: otherUserId, name: 'Unknown User' };
            }

            setUserCache(prev => ({ ...prev, [otherUserId]: otherUser }));
          }

          return {
            ...conv,
            otherUser,
            otherUserId
          };
        })
      );

      setConversations(enrichedConversations);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      showError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId, conversationId) => {
    try {
      console.log('Fetching messages for user:', otherUserId);
      const response = await messageApi.getConversation(otherUserId);
      console.log('Fetched messages response:', response.data);
      const fetchedMessages = response.data.messages || response.data || [];

      const sortedMessages = [...fetchedMessages].sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt)
      );

      console.log('Setting messages:', sortedMessages);
      setMessages(sortedMessages);

      if (conversationId) {
        await messageApi.markAsRead(conversationId);

        // then, update local state immediately
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      showError('Failed to load messages');
    }
  };

  const handleSelectConversation = (conversation) => {
    console.log('Selected conversation:', conversation);

    const conversationId = conversation._id;
    const [user1Id, user2Id] = conversationId.split('_');
    const otherUserId = user1Id === user._id ? user2Id : user1Id;

    console.log('Current user ID:', user._id);
    console.log('Other user ID:', otherUserId);

    const updatedConversation = {
      ...conversation,
      conversationId: conversationId,
      otherUserId: otherUserId
    };

    setSelectedConversation(updatedConversation);

    fetchMessages(otherUserId, conversationId);

    setMessageText('');
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const createNewConversation = async (userId, productId) => {
    try {
      console.log('Creating conversation for userId:', userId, 'productId:', productId);


      const tempConversation = {
        _id: userId,
        name: 'Loading...',
        otherUser: {
          _id: userId,
          name: 'Loading...'
        },
        product: null,
        messages: []
      };

      setSelectedConversation(tempConversation);
      setMessages([]);

      // parallel fetching sa user and product info
      const [userResponse, productResponse] = await Promise.all([
        userId ? getUserProfile(userId).catch(err => {
          console.error('Failed to fetch user:', err);
          return null;
        }) : Promise.resolve(null),
        productId ? getProduct(productId).catch(err => {
          console.error('Failed to fetch product:', err);
          return null;
        }) : Promise.resolve(null)
      ]);

      const userInfo = userResponse?.data;
      const productInfo = productResponse?.data;

      console.log('User info:', userInfo);
      console.log('Product info:', productInfo);

      // update conversation with actual data
      const updatedConversation = {
        _id: userId,
        name: userInfo?.name || 'Unknown User',
        otherUser: userInfo || {
          _id: userId,
          name: 'Unknown User'
        },
        product: productInfo,
        messages: []
      };

      console.log('Updating conversation with fetched data:', updatedConversation);
      setSelectedConversation(updatedConversation);
    } catch (err) {
      console.error('Failed to create conversation:', err);
      showError('Failed to open conversation');
    }
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

      console.log('Sending message with data:', messageData);
      const response = await messageApi.sendMessage(messageData);
      const messageFromResponse = response.data?.message || response.data;

      // replace optimistic message with real message from server
      setMessages((prev) =>
        prev.map((msg) => msg._id === tempId ? { ...messageFromResponse, status: 'sent' } : msg)
      );

      // emit socket event
      if (socket) {
        socket.emit('sendMessage', messageFromResponse);
      }

      scrollToBottom();

    } catch (err) {
      console.error('Failed to send message:', err);
      showError('Failed to send message');

      // remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.status !== 'sending'));
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

    return conversation.name ||
           conversation.otherUser?.name ||
           conversation.otherUser?.username ||
           'Unknown User';
  };

  const getUserRole = (conversation) => {
    // determine if user is buyer or seller in this conversation
    if (conversation.product) {
      const sellerId = typeof conversation.product.seller === 'object'
        ? conversation.product.seller?._id
        : conversation.product.seller;
      const isSeller = sellerId === user._id;
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
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* main container */}
      <div className="flex-1 flex md:p-4 overflow-hidden bg-gray-50">
        <div className="w-full max-w-7xl mx-auto flex md:rounded-lg md:shadow-lg overflow-hidden bg-white">

          {/* left: conversations list */}
          <div className={`${
            selectedConversation ? 'hidden md:flex' : 'flex'
          } w-full md:w-[380px] flex-col border-r border-gray-200`}>

            {/* conversations header */}
            <div className="h-[73px] flex-shrink-0 p-4 border-b border-gray-200 bg-white flex items-center">
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
                <div className="flex-shrink-0">
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
                </div>
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
