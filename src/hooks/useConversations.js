import { useState, useCallback } from 'react';
import * as messageApi from '../api/messages';
import { getUserProfile } from '../api/users';
import { getProduct } from '../api/products';
import { extractOtherUserId } from '../utils/conversationHelpers';
import { logger } from '../utils/logger';

export const useConversations = (userId) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState({});

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await messageApi.getConversations();

      const enrichedConversations = await Promise.all(
        (response.data || []).map(async (conv) => {
          const otherUserId = extractOtherUserId(conv._id, userId);

          let otherUser = userCache[otherUserId];

          if (!otherUser) {
            try {
              const userResponse = await getUserProfile(otherUserId);
              otherUser = userResponse.data;
            } catch (err) {
              logger.error('Failed to fetch user:', otherUserId, err);
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
      logger.error('Failed to fetch conversations:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, userCache]);

  const createNewConversation = useCallback(async (otherUserId, productId) => {
    try {

      // fetch user and product info in parallel
      const [userResponse, productResponse] = await Promise.all([
        otherUserId ? getUserProfile(otherUserId).catch(err => {
          logger.error('Failed to fetch user:', err);
          return null;
        }) : Promise.resolve(null),
        productId ? getProduct(productId).catch(err => {
          logger.error('Failed to fetch product:', err);
          return null;
        }) : Promise.resolve(null)
      ]);

      const userInfo = userResponse?.data;
      const productInfo = productResponse?.data;

      // update conversation with actual data
      const updatedConversation = {
        _id: otherUserId,
        name: userInfo?.name || 'Unknown User',
        otherUser: userInfo || {
          _id: otherUserId,
          name: 'Unknown User'
        },
        product: productInfo,
        messages: []
      };

      return updatedConversation;
    } catch (err) {
      logger.error('Failed to create conversation:', err);
      throw err;
    }
  }, []);

  return {
    conversations,
    setConversations,
    loading,
    fetchConversations,
    createNewConversation
  };
};