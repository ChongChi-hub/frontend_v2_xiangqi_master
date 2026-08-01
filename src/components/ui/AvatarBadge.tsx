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
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBUv5WYpYueb_kCjyoHc3kjDQLGlPUTF9lIqaiFdCNfW0B2U-GN_VIl9TkJgh3QEtCMiNvX299saFC2DbAoxNKWXvZO7XnW6l2lKDmqrN3VQzOC2AK18V6dB3V2w7I2uQg2KVZpj3HJsGkNaQFKG1W9yYDWrwH3IgsX1CNCPI3TdU1lYqxRhZTRWWpjaOvMIH3VAsLtKJF8d-h0yh2OHh87SKVogIT_uQKSxZZfVbuSO3xvqpGVRk_Q';

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
