import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  variant?: 'primary' | 'error' | 'neutral';
  hasRightBorder?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  variant = 'neutral',
  hasRightBorder = true,
}) => {
  const getValueColor = () => {
    switch (variant) {
      case 'primary':
        return 'text-[#442a22]';
      case 'error':
        return 'text-[#ba1a1a]';
      default:
        return 'text-[#504441]';
    }
  };

  return (
    <div
      className={`text-center px-3 ${
        hasRightBorder ? 'border-r border-[#d4c3be]/40' : ''
      }`}
    >
      <p className="text-xs text-[#504441] font-medium mb-0.5">{label}</p>
      <p className={`font-serif text-xl font-bold ${getValueColor()}`}>
        {value}
      </p>
    </div>
  );
};

export default StatCard;
