import React from 'react';
import type { LeaderboardItem } from '@/types/user';
import { RankItem } from '@/components/Dashboard/RankItem';
import { Trophy } from 'lucide-react';

interface LeaderboardSidebarProps {
  items?: LeaderboardItem[];
  currentUserElo?: number;
  currentUsername?: string;
  isLoading?: boolean;
}

// Fallback mock leaderboard if backend is loading/empty
const MOCK_LEADERBOARD: LeaderboardItem[] = [
  { id: '1', username: 'Thiên Hạ Đệ Nhất', eloScore: 2840, winMatches: 310, loseMatches: 20, drawMatches: 5 },
  { id: '2', username: 'Trạng Nguyên', eloScore: 2715, winMatches: 245, loseMatches: 35, drawMatches: 12 },
  { id: '3', username: 'Lão Kỳ Vương', eloScore: 2650, winMatches: 198, loseMatches: 40, drawMatches: 22 },
  { id: '4', username: 'Vua Cờ Vây', eloScore: 2410, winMatches: 150, loseMatches: 50, drawMatches: 10 },
  { id: '5', username: 'Độc Cô Cầu Bại', eloScore: 2320, winMatches: 130, loseMatches: 45, drawMatches: 8 },
];

export const LeaderboardSidebar: React.FC<LeaderboardSidebarProps> = ({
  items,
  currentUserElo = 1850,
  currentUsername = 'Kỳ Thủ (Bạn)',
  isLoading,
}) => {
  const displayList = items && items.length > 0 ? items : MOCK_LEADERBOARD;

  return (
    <aside className="w-full space-y-6">
      <div className="bg-[#ffffff] border border-[#d4c3be] rounded-xl overflow-hidden shadow-xs sticky top-24">
        {/* Header */}
        <div className="bg-[#eae7e7] px-5 py-3.5 border-b border-[#d4c3be] flex justify-between items-center">
          <h3 className="font-serif text-base font-bold text-[#442a22] flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-600" />
            Bảng Xếp Hạng
          </h3>
          <span className="text-xs font-bold text-[#442a22] hover:underline cursor-pointer">
            Tất cả
          </span>
        </div>

        {/* List Content */}
        <div className="max-h-[550px] overflow-y-auto divide-y divide-[#d4c3be]/30">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-10 bg-[#f0eded] rounded-md animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {displayList.map((item, index) => (
                <RankItem key={item.id || index} item={item} rank={index + 1} />
              ))}

              {/* Current User Simulated Row */}
              <RankItem
                item={{
                  id: 'user_self',
                  username: currentUsername,
                  eloScore: currentUserElo,
                  winMatches: 0,
                  loseMatches: 0,
                  drawMatches: 0,
                }}
                rank={42}
                isCurrentUser
              />
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default LeaderboardSidebar;
