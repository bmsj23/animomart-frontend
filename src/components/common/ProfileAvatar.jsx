import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { getProfilePictureUrl } from '../../utils/imageCache';

const ProfileAvatar = ({
  user,
  size = 'md',
  className = '',
  showFallback = true
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  // size classes
  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
    '3xl': 'w-24 h-24',
  };

  const iconSizes = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
    '3xl': 'w-12 h-12',
  };

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const url = await getProfilePictureUrl(user);

        if (isMounted) {
          if (url) {
            setImageUrl(url);
            setImageError(false);
          } else {
            setImageError(true);
          }
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setImageError(true);
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ${className}`}>
      {loading ? (
        <div className="w-full h-full bg-gray-300 animate-pulse" />
      ) : imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={user?.name || 'Profile'}
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
      ) : showFallback ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-300">
          <User className={`${iconSizes[size]} text-gray-500`} />
        </div>
      ) : null}
    </div>
  );
};

export default ProfileAvatar;