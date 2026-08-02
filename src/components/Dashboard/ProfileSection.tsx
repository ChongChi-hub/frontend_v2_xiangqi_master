import React from 'react';
import { Dropdown, Modal, message, type MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LogOut, Star } from 'lucide-react';
import type { UserProfile } from '@/types/user';
import type { User } from '@/types/auth';
import { getTitleFromElo } from '@/types/user';
import { useAuthStore } from '@/store/auth.store';
import { useMatchStore } from '@/store/match.store';
import socketService from '@/services/socket.service';
import { StatCard } from '@/components/ui/StatCard';
import { AvatarBadge } from '@/components/ui/AvatarBadge';

interface ProfileSectionProps {
  user?: UserProfile | User | null;
  isLoading?: boolean;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  isLoading,
}) => {
  const navigate = useNavigate();
  const authStoreUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { activeMatch, clearActiveMatch } = useMatchStore();

  const handleLogout = () => {
    if (activeMatch) {
      Modal.confirm({
        title: '⚠️ Cảnh báo rời ván đấu!',
        content:
          'Bạn đang trong ván đấu trực tuyến PvP! Nếu đăng xuất lúc này, bạn sẽ bị tính là thua cuộc (-30 ELO). Bạn có chắc chắn muốn đăng xuất không?',
        okText: 'Đầu hàng & Đăng xuất',
        cancelText: 'Ở lại ván đấu',
        okButtonProps: { danger: true },
        onOk: () => {
          socketService.resignMatch(activeMatch.matchId);
          clearActiveMatch();
          logout();
          message.success('Đã đăng xuất thành công');
          navigate('/login');
        },
      });
      return;
    }

    logout();
    message.success('Đã đăng xuất thành công');
    navigate('/login');
  };

  if (isLoading && !authStoreUser) {
    return (
      <section className="bg-[#f6f3f2] border border-[#d4c3be] rounded-xl p-6 relative overflow-hidden animate-pulse">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="w-28 h-28 rounded-full bg-[#e4e2e1]" />
          <div className="flex-1 space-y-3 w-full text-center md:text-left">
            <div className="h-8 bg-[#e4e2e1] rounded-md w-48 mx-auto md:mx-0" />
            <div className="h-6 bg-[#e4e2e1] rounded-full w-36 mx-auto md:mx-0" />
            <div className="h-14 bg-[#e4e2e1] rounded-lg w-full max-w-sm" />
          </div>
        </div>
      </section>
    );
  }

  // Prioritize API profile user, fallback to auth store user, then fallback name
  const username = user?.username || authStoreUser?.username || 'Kỳ Thủ';
  const eloScore = user?.eloScore ?? authStoreUser?.eloScore ?? 1200;
  const winMatches = user?.winMatches ?? authStoreUser?.winMatches ?? 0;
  const loseMatches = user?.loseMatches ?? authStoreUser?.loseMatches ?? 0;
  const drawMatches = user?.drawMatches ?? authStoreUser?.drawMatches ?? 0;
  const title = getTitleFromElo(eloScore);

  const menuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div className="px-2 py-1.5 border-b border-[#e5e5e5]">
          <p className="font-bold text-[#442a22] font-sans text-sm">{username}</p>
          <p className="text-xs text-[#504441] mt-0.5">{title} ({eloScore} ELO)</p>
        </div>
      ),
      disabled: true,
    },
    {
      key: 'logout',
      danger: true,
      icon: <LogOut className="w-4 h-4" />,
      label: <span className="font-bold font-sans">Đăng xuất tài khoản</span>,
      onClick: handleLogout,
    },
  ];

  return (
    <section className="bg-[#f6f3f2] border border-[#d4c3be] rounded-xl p-6 relative overflow-hidden shadow-xs">
      {/* Texture Background */}
      <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none bg-[radial-gradient(#d4c3be_0.5px,transparent_0.5px)] [background-size:24px_24px]" />

      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10">
        <Dropdown menu={{ items: menuItems }} placement="bottomLeft" trigger={['click', 'hover']}>
          <div className="cursor-pointer transition-transform hover:scale-105" title={`Tài khoản: ${username} (Bấm để xem tuỳ chọn)`}>
            <AvatarBadge size="xl" isOnline borderClass="border-[#442a22]" />
          </div>
        </Dropdown>

        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#442a22] mb-1">
            {username}
          </h3>

          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <span className="bg-[#005313] text-[#ffffff] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-2xs">
              <Star className="w-3.5 h-3.5 fill-current text-yellow-300" />
              ELO: {eloScore}
            </span>
            <span className="text-[#504441] text-sm font-semibold font-sans">
              {title}
            </span>
          </div>

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-3 gap-2 bg-white/70 backdrop-blur-xs rounded-lg p-2.5 border border-[#d4c3be]/40 max-w-sm mx-auto md:mx-0">
            <StatCard label="Thắng" value={winMatches} variant="primary" />
            <StatCard label="Thua" value={loseMatches} variant="error" />
            <StatCard label="Hòa" value={drawMatches} variant="neutral" hasRightBorder={false} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;
