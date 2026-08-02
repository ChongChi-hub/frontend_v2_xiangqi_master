import React from 'react';
import type { LeaderboardItem } from '@/types/user';
import { TrendingUp, Minus, TrendingDown, Crown, Medal } from 'lucide-react';
import { motion } from 'framer-motion';

interface RankItemProps {
  item: LeaderboardItem;
  rank: number;
  isCurrentUser?: boolean;
}

export const RankItem: React.FC<RankItemProps> = ({ item, rank, isCurrentUser }) => {
  const isTop3 = rank <= 3;

  const getRankBadge = () => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500 drop-shadow-md" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-400 drop-shadow-sm" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600 drop-shadow-sm" />;
      default:
        return <span className="font-serif font-bold text-sm text-[#827470]">{rank}</span>;
    }
  };

  const getStyle = () => {
    if (isCurrentUser) {
      return 'bg-[#5d4037]/10 border-l-4 border-l-[#442a22] shadow-sm';
    }
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/10 to-transparent border-l-4 border-l-yellow-500 shadow-sm';
      case 2:
        return 'bg-gradient-to-r from-slate-400/10 to-transparent border-l-4 border-l-slate-400 shadow-sm';
      case 3:
        return 'bg-gradient-to-r from-amber-600/10 to-transparent border-l-4 border-l-amber-600 shadow-sm';
      default:
        return 'bg-[#ffffff] hover:bg-[#f6f3f2]/50 border-l-4 border-l-transparent';
    }
  };

  const getAvatarBorder = () => {
    switch (rank) {
      case 1:
        return 'border-yellow-500 ring-2 ring-yellow-500/30';
      case 2:
        return 'border-slate-300 ring-2 ring-slate-300/30';
      case 3:
        return 'border-amber-600/70 ring-2 ring-amber-600/20';
      default:
        return 'border-[#d4c3be]/40';
    }
  };

  const renderTrendIcon = () => {
    if (rank === 1) return <TrendingUp className="w-4 h-4 text-[#005313]" />;
    if (rank === 2) return <Minus className="w-4 h-4 text-[#504441]" />;
    return <TrendingDown className="w-4 h-4 text-[#ba1a1a]" />;
  };

  const defaultAvatar =
    item.avatarUrl || 'https://res.cloudinary.com/znkrqbvm/image/upload/v1785675573/xiangqi_avatars/vlbrdpdmurh7mwtmqbxt.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: rank * 0.05 }}
      className={`flex items-center gap-3 px-4 py-3 border-b border-[#d4c3be]/30 transition-all duration-300 ${getStyle()}`}
    >
      {/* Rank Badge */}
      <div className="flex flex-col items-center justify-center w-8 shrink-0">
        {getRankBadge()}
      </div>

      {/* Avatar */}
      <div
        className={`relative w-10 h-10 rounded-full border-2 ${getAvatarBorder()} overflow-hidden shrink-0 bg-white`}
      >
        <img src={defaultAvatar} alt={item.username} className="w-full h-full object-cover" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-serif truncate ${
            isTop3 ? 'text-sm font-bold text-[#442a22]' : 'text-xs font-semibold text-[#1b1c1c]'
          }`}
        >
          {item.username} {isCurrentUser && <span className="text-[#827470] font-normal">(Bạn)</span>}
        </p>
        <p className="text-[11px] text-[#827470] mt-0.5 font-medium">
          ELO <span className="font-bold text-[#ba1a1a]">{item.eloScore}</span>
        </p>
      </div>

      {/* Stats/Trend */}
      <div className="shrink-0 flex items-center gap-2">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-[#504441] font-medium">{item.winMatches} Thắng</p>
          <p className="text-[10px] text-[#827470]">{Math.round((item.winMatches / (item.winMatches + item.loseMatches + item.drawMatches || 1)) * 100)}% Win Rate</p>
        </div>
        {renderTrendIcon()}
      </div>
    </motion.div>
  );
};

export default RankItem;
