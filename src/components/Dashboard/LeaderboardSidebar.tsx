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

export const LeaderboardSidebar: React.FC<LeaderboardSidebarProps> = ({
  items,
  currentUserElo = 1200,
  currentUsername = 'Kỳ Thủ (Bạn)',
  isLoading,
}) => {
  const displayList = items || [];

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
          ) : displayList.length > 0 ? (
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
                rank={displayList.findIndex(u => u.username === currentUsername) > -1 ? displayList.findIndex(u => u.username === currentUsername) + 1 : displayList.length + 1}
                isCurrentUser
              />
            </>
          ) : (
            <div className="p-6 text-center text-[#827470] text-sm">
              Chưa có dữ liệu xếp hạng
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default LeaderboardSidebar;
