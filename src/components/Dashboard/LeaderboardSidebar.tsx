import React from 'react';
import { Link } from 'react-router-dom';
import type { LeaderboardItem } from '@/types/user';
import { RankItem } from '@/components/Dashboard/RankItem';
import { Trophy, ChevronRight } from 'lucide-react';
import { Spin } from 'antd';

interface LeaderboardSidebarProps {
  items?: LeaderboardItem[];
  currentUserElo?: number;
  currentUsername?: string;
  isLoading?: boolean;
}

export const LeaderboardSidebar: React.FC<LeaderboardSidebarProps> = ({
  items,
  currentUserElo = 1200,
  currentUsername = 'Kỳ Thủ',
  isLoading,
}) => {
  const displayList = items || [];

  return (
    <aside className="w-full space-y-6">
      <div className="bg-[#ffffff] border border-[#d4c3be] rounded-2xl overflow-hidden shadow-sm sticky top-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5d4037] to-[#442a22] px-5 py-4 flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <h3 className="font-serif text-lg font-bold text-[#ffdad6] flex items-center gap-2 relative z-10 shadow-sm">
            <Trophy className="w-5 h-5 text-yellow-500 drop-shadow-md" />
            Bảng Xếp Hạng
          </h3>
          <Link
            to="/leaderboard"
            className="text-xs font-medium text-[#ffdad6]/80 hover:text-white flex items-center gap-0.5 relative z-10 transition-colors"
          >
            Xem tất cả <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* List Content */}
        <div className="max-h-[550px] overflow-y-auto bg-[#faf8f7]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-10 space-y-4">
              <Spin size="large" />
              <p className="text-sm text-[#827470]">Đang tải bảng xếp hạng...</p>
            </div>
          ) : displayList.length > 0 ? (
            <div className="flex flex-col">
              {displayList.map((item, index) => (
                <RankItem 
                  key={item.id || index} 
                  item={item} 
                  rank={index + 1} 
                  isCurrentUser={item.username === currentUsername}
                />
              ))}

              {/* Current User Simulated Row - Only show if not in top list */}
              {displayList.findIndex(u => u.username === currentUsername) === -1 && (
                <div className="mt-2 relative">
                  <div className="absolute -top-2 left-0 right-0 flex justify-center">
                    <div className="px-3 bg-[#faf8f7] text-[10px] text-[#827470] font-bold tracking-widest uppercase">
                      Hạng của bạn
                    </div>
                  </div>
                  <div className="border-t-2 border-dashed border-[#d4c3be] mt-2"></div>
                  <RankItem
                    item={{
                      id: 'user_self',
                      username: currentUsername,
                      eloScore: currentUserElo,
                      winMatches: 0,
                      loseMatches: 0,
                      drawMatches: 0,
                    }}
                    rank={displayList.length + 1} // Simplified rank
                    isCurrentUser
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#f6f3f2] flex items-center justify-center">
                <Trophy className="w-6 h-6 text-[#d4c3be]" />
              </div>
              <p className="text-[#827470] text-sm">Chưa có dữ liệu xếp hạng</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default LeaderboardSidebar;
