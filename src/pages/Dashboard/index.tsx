import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { message } from 'antd';
import { useUserProfile, useLeaderboard } from '@/hooks/useUser';
import { useAuthStore } from '@/store/auth.store';
import { useMatchStore } from '@/store/match.store';
import { ProfileSection } from '@/components/Dashboard/ProfileSection';
import { QuickMatchBanner } from '@/components/Dashboard/QuickMatchBanner';
import { GameModesGrid } from '@/components/Dashboard/GameModesGrid';
import { LeaderboardSidebar } from '@/components/Dashboard/LeaderboardSidebar';
import PvpPage from '@/pages/PVP';
import socketService, { type MatchFoundData } from '@/services/socket.service';
import { Gamepad2, Cpu, History, Trophy } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const authStoreUser = useAuthStore((state) => state.user);
  const { data: profileData, isLoading: isProfileLoading } = useUserProfile();
  const { data: leaderboardData, isLoading: isLeaderboardLoading } = useLeaderboard();
  const { activeMatch, setActiveMatch, clearActiveMatch } = useMatchStore();

  const [activeMatchData, setActiveMatchData] = useState<MatchFoundData | null>(activeMatch);

  const user = profileData?.user || authStoreUser;
  const username = user?.username || 'Kỳ Thủ';
  const eloScore = user?.eloScore ?? 1200;

  // Listen for real-time PvP match_found events from Socket.io
  useEffect(() => {
    const socket = socketService.connect();

    const handleMatchFound = (data: MatchFoundData) => {
      console.log('[Dashboard] Match Found Event Received:', data);
      message.success('Đã tìm thấy đối thủ PvP! Ván đấu bắt đầu ngay tại Sảnh...');
      setActiveMatchData(data);
      setActiveMatch(data);
    };

    socket.on('match_found', handleMatchFound);

    return () => {
      socket.off('match_found', handleMatchFound);
    };
  }, [setActiveMatch]);

  return (
    <div className="w-full min-h-screen bg-[#fcf9f8] text-[#1b1c1c] pb-16 md:pb-8">
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 md:px-16 py-6">
        {/* If Active Match is in progress, render PVP Chess Arena directly inside Sảnh Đấu */}
        {activeMatchData ? (
          <PvpPage
            initialMatchDataOverride={activeMatchData}
            onMatchEndComplete={() => {
              setActiveMatchData(null);
              clearActiveMatch();
            }}
          />
        ) : (
          /* Standard Dashboard Lobby Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Area (8 cols on Desktop) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Profile Section */}
              <ProfileSection user={user} isLoading={isProfileLoading && !authStoreUser} />

              {/* Quick Match Banner connected to Socket.io */}
              <QuickMatchBanner
                onFindMatch={() => socketService.findMatch()}
                onCancelMatch={() => socketService.cancelFindMatch()}
              />

              {/* Game Modes Grid */}
              <GameModesGrid />
            </div>

            {/* Right Sidebar: Leaderboard (4 cols on Desktop) */}
            <div className="lg:col-span-4">
              <LeaderboardSidebar
                items={leaderboardData?.leaderboard}
                currentUserElo={eloScore}
                currentUsername={`${username} (Bạn)`}
                isLoading={isLeaderboardLoading}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#ffffff] border-t border-[#d4c3be] flex justify-around items-center py-2 z-50 shadow-lg">
        <Link to="/dashboard" className="flex flex-col items-center gap-1 text-[#442a22]">
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px] font-bold font-serif">Sảnh</span>
        </Link>

        <Link to="/pve" className="flex flex-col items-center gap-1 text-[#504441] hover:text-[#442a22]">
          <Cpu className="w-5 h-5" />
          <span className="text-[10px] font-medium font-sans">AI</span>
        </Link>

        <span className="flex flex-col items-center gap-1 text-[#504441] opacity-60">
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium font-sans">Lịch sử</span>
        </span>

        <span className="flex flex-col items-center gap-1 text-[#504441] opacity-60">
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-medium font-sans">Hạng</span>
        </span>
      </nav>
    </div>
  );
};

export default DashboardPage;
