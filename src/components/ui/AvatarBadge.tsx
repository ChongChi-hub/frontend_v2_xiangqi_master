import React from 'react';

interface AvatarBadgeProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  borderClass?: string;
}

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  src,
  alt = 'Kỳ thủ',
  size = 'md',
  isOnline,
  borderClass = 'border-[#442a22]',
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-20 h-20';
      case 'xl':
        return 'w-28 h-28 md:w-32 md:h-32';
      default:
        return 'w-10 h-10';
    }
  };

  const defaultAvatar =
    'https://res.cloudinary.com/znkrqbvm/image/upload/v1785675573/xiangqi_avatars/vlbrdpdmurh7mwtmqbxt.png';

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={`${getSizeClass()} rounded-full border-2 ${borderClass} overflow-hidden shadow-md bg-white`}
      >
        <img
          src={src || defaultAvatar}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>

      {isOnline && (
        <span className="absolute bottom-0 right-0 bg-[#00390a] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-xs border border-white">
          Online
        </span>
      )}
    </div>
  );
};

export default AvatarBadge;
