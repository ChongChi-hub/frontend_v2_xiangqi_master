import React from 'react';
import type { LeaderboardItem } from '@/types/user';
import { Trophy, TrendingUp, Minus, TrendingDown } from 'lucide-react';

interface RankItemProps {
  item: LeaderboardItem;
  rank: number;
  isCurrentUser?: boolean;
}

export const RankItem: React.FC<RankItemProps> = ({
  item,
  rank,
  isCurrentUser,
}) => {
  const getRankBadge = () => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-slate-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="font-serif font-bold text-xs text-[#504441]">{rank}</span>;
    }
  };

  const getBorderColor = () => {
    switch (rank) {
      case 1:
        return 'border-yellow-500/40';
      case 2:
        return 'border-slate-300';
      case 3:
        return 'border-amber-500/30';
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
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDHDRcOs7ncvcOBUMISVy1a_NpuPcNcRO4kuyUvrqPAGmZd3FAt-6EHm48k72xsNwSIeEEYn92-ZMMeC-z9Zp0Zm2VMtHAEyz1slxIsyLxx4P_NEUikiFKRYJu84IrxDWPxNU2XZ0YtNb6y1oTmZVrm63FDlxF0SImne4yPrm9Rsg_infXqFLwuNGHZHRlIznVuYoC-_zR-5upV2XSKEU_5SxCeB0c_mqwfTZQcKDBf2S_A-5KTzzTv';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-[#d4c3be]/30 transition-colors ${
        isCurrentUser
          ? 'bg-[#5d4037]/10 border-l-4 border-l-[#442a22]'
          : rank === 1
          ? 'bg-[#f6f3f2]'
          : 'bg-[#ffffff] hover:bg-[#f6f3f2]/50'
      }`}
    >
      {/* Rank Badge */}
      <div className="flex flex-col items-center justify-center w-6 shrink-0">
        {getRankBadge()}
      </div>

      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-full border-2 ${getBorderColor()} overflow-hidden shrink-0 bg-white`}
      >
        <img src={defaultAvatar} alt={item.username} className="w-full h-full object-cover" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-serif text-xs font-bold text-[#1b1c1c] truncate">
          {item.username} {isCurrentUser && '(Bạn)'}
        </p>
        <p className="text-[10px] text-[#504441]">ELO {item.eloScore}</p>
      </div>

      {/* Trend Icon */}
      <div className="shrink-0">{renderTrendIcon()}</div>
    </div>
  );
};

export default RankItem;
