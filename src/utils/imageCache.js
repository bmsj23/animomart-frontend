// utility to cache and manage profile pictures with fallback support
import { logger } from './logger';

const IMAGE_CACHE_KEY = 'animomart_image_cache';
const CACHE_EXPIRY_HOURS = 24;

export const getCachedImageUrl = (userId) => {
  if (!userId) return null;

  try {
    const cache = JSON.parse(localStorage.getItem(IMAGE_CACHE_KEY) || '{}');
    const cached = cache[userId];

    if (!cached) return null;

    // check if cache expired
    const now = Date.now();
    const expiryTime = cached.timestamp + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);

    if (now > expiryTime) {
      // expired, remove from cache
      delete cache[userId];
      localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
      return null;
    }

    return cached.url;
  } catch (error) {
    logger.error('error reading image cache:', error);
    return null;
  }
};

export const cacheImageUrl = (userId, imageUrl) => {
  if (!userId || !imageUrl) return;

  try {
    const cache = JSON.parse(localStorage.getItem(IMAGE_CACHE_KEY) || '{}');
    cache[userId] = {
      url: imageUrl,
      timestamp: Date.now()
    };
    localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    logger.error('error caching image:', error);
  }
};

export const cleanImageCache = () => {
  try {
    const cache = JSON.parse(localStorage.getItem(IMAGE_CACHE_KEY) || '{}');
    const now = Date.now();
    const expiryTime = CACHE_EXPIRY_HOURS * 60 * 60 * 1000;

    let hasChanges = false;
    Object.keys(cache).forEach(userId => {
      if (now - cache[userId].timestamp > expiryTime) {
        delete cache[userId];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
    }
  } catch (error) {
    logger.error('error cleaning image cache:', error);
  }
};

export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('no url provided'));
      return;
    }

    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error('failed to load image'));
    img.src = url;
  });
};

// get profile picture with fallback and caching
export const getProfilePictureUrl = async (user) => {
  if (!user) return null;

  const userId = user._id || user.id;
  if (!userId) return null;

  // check cache first
  const cachedUrl = getCachedImageUrl(userId);
  if (cachedUrl) {
    try {
      await preloadImage(cachedUrl);
      return cachedUrl;
    } catch {
      // c
    }
  }

  // get fresh url from user object
  const pictureUrl = user.profilePicture || user.picture;
  if (!pictureUrl) return null;

  // enhance google profile picture quality
  const enhancedUrl = pictureUrl.replace(/=s\d+-c/, '=s400-c');

  try {
    await preloadImage(enhancedUrl);
    cacheImageUrl(userId, enhancedUrl);
    return enhancedUrl;
  } catch {
    return null;
  }
};