import React from 'react';
import { Link } from 'react-router-dom';
import { useUserProfile, useLeaderboard } from '@/hooks/useUser';
import { useAuthStore } from '@/store/auth.store';
import { ProfileSection } from '@/components/Dashboard/ProfileSection';
import { QuickMatchBanner } from '@/components/Dashboard/QuickMatchBanner';
import { GameModesGrid } from '@/components/Dashboard/GameModesGrid';
import { LeaderboardSidebar } from '@/components/Dashboard/LeaderboardSidebar';
import { Gamepad2, Cpu, History, Trophy } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const authStoreUser = useAuthStore((state) => state.user);
  const { data: profileData, isLoading: isProfileLoading } = useUserProfile();
  const { data: leaderboardData, isLoading: isLeaderboardLoading } = useLeaderboard();

  const user = profileData?.user || authStoreUser;
  const username = user?.username || 'Kỳ Thủ';
  const eloScore = user?.eloScore ?? (user as any)?.eloScore ?? 1850;

  return (
    <div className="w-full min-h-screen bg-[#fcf9f8] text-[#1b1c1c] pb-16 md:pb-8">
      {/* Main Content Layout (12-column grid on Desktop, 1 column on Mobile) */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 md:px-16 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Area (8 cols on Desktop) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Profile Section */}
            <ProfileSection user={user} isLoading={isProfileLoading && !authStoreUser} />

            {/* Quick Match Banner */}
            <QuickMatchBanner />

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
