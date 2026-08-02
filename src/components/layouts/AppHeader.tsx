import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Users, Bell, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export const AppHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

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
      case '/leaderboard':
        return 'Bảng Xếp Hạng';
      case '/history':
        return 'Lịch sử đấu';
      default:
        return 'Xiangqi Master';
    }
  };

  const username = user?.username || 'Kỳ Thủ';
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

        {/* User Avatar linking to Profile (disabled in Admin layout) */}
        <div
          onClick={() => {
            if (!location.pathname.startsWith('/admin')) {
              navigate('/profile');
            }
          }}
          title={location.pathname.startsWith('/admin') ? `Admin: ${username}` : `Hồ sơ: ${username}`}
          className={`flex items-center gap-2.5 px-2.5 py-1 rounded-full bg-[#f4f2ee] hover:bg-[#e8e5df] border border-[#d4c3be] transition-all shadow-xs ${location.pathname.startsWith('/admin') ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#361e15] font-bold text-xs overflow-hidden border border-[#d4c3be]">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={username} className="w-full h-full object-cover bg-white" />
            ) : (
              <UserIcon className="w-4 h-4 text-[#361e15]" />
            )}
          </div>
          <span className="hidden sm:inline font-sans text-xs font-bold text-[#442a22]">
            {username}
          </span>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
