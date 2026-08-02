import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown, Modal, message, type MenuProps } from 'antd';
import { Users, Bell, User as UserIcon, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useMatchStore } from '@/store/match.store';
import socketService from '@/services/socket.service';
import { getTitleFromElo } from '@/types/user';

export const AppHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
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

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
      case '/':
        return 'Sảnh đấu';
      case '/pve':
        return 'Đấu với AI';
      case '/rooms':
        return 'Phòng riêng';
      case '/admin/dashboard':
        return 'Tổng quan Admin';
      case '/admin/users':
        return 'Quản lý người dùng';
      case '/admin/matches':
        return 'Quản lý trận đấu';
      default:
        return 'Xiangqi Master';
    }
  };

  const username = user?.username || 'Kỳ Thủ';
  const elo = user?.eloScore ?? 1200;
  const userTitle = getTitleFromElo(elo);

  const menuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div className="px-2 py-1.5 border-b border-[#e5e5e5]">
          <p className="font-bold text-[#442a22] font-sans text-sm">{username}</p>
          <p className="text-xs text-[#504441] mt-0.5">{userTitle} ({elo} ELO)</p>
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
    <header className="flex justify-between items-center w-full px-4 sm:px-8 md:px-16 py-3 bg-[#fcf9f8]/90 backdrop-blur-md border-b border-[#d4c3be] md:pl-72 fixed top-0 left-0 z-40">
      {/* Left side: Mobile Brand vs Desktop Page Title */}
      <div className="md:hidden flex items-center gap-2">
        <Link to="/home" className="font-serif text-xl font-bold text-[#442a22] hover:text-[#5d4037] transition-colors">
          Xiangqi Master
        </Link>
      </div>
      <div className="hidden md:block">
        <h2 className="font-serif text-2xl font-bold text-[#442a22]">
          {getPageTitle()}
        </h2>
      </div>

      {/* Right side: Action icons & User profile avatar with dropdown */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          title="Nhóm"
          className="text-[#504441] hover:bg-[#f6f3f2] p-2 rounded-full transition-colors cursor-pointer"
        >
          <Users className="w-5 h-5" />
        </button>

        <button
          type="button"
          title="Thông báo"
          className="text-[#504441] hover:bg-[#f6f3f2] p-2 rounded-full transition-colors relative cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full animate-pulse" />
        </button>

        {/* User Avatar with Dropdown Menu */}
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click', 'hover']}>
          <div
            title={`Tài khoản: ${username}`}
            className="flex items-center gap-2.5 px-2.5 py-1 rounded-full bg-[#f4f2ee] hover:bg-[#e8e5df] border border-[#d4c3be] cursor-pointer transition-all shadow-xs"
          >
            <div className="w-8 h-8 rounded-full bg-[#361e15] flex items-center justify-center text-white font-bold text-xs">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:inline font-sans text-xs font-bold text-[#442a22]">
              {username}
            </span>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

export default AppHeader;
