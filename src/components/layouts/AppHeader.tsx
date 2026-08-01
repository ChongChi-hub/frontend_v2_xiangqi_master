import React from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Bell, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export const AppHeader: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
      case '/':
        return 'Sảnh đấu';
      case '/pve':
        return 'Đấu với AI';
      default:
        return 'Xiangqi Master';
    }
  };

  return (
    <header className="flex justify-between items-center w-full px-4 sm:px-8 md:px-16 py-3 bg-[#fcf9f8]/90 backdrop-blur-md border-b border-[#d4c3be] md:pl-72 fixed top-0 left-0 z-40">
      {/* Left side: Mobile Brand vs Desktop Page Title */}
      <div className="md:hidden flex items-center gap-2">
        <span className="font-serif text-xl font-bold text-[#442a22]">
          Xiangqi Master
        </span>
      </div>
      <div className="hidden md:block">
        <h2 className="font-serif text-2xl font-bold text-[#442a22]">
          {getPageTitle()}
        </h2>
      </div>

      {/* Right side: Action icons & User profile button */}
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

        <div
          title={user?.username || 'Cá nhân'}
          className="w-9 h-9 rounded-full bg-[#e4e2dd] border border-[#d4c3be] flex items-center justify-center cursor-pointer hover:bg-[#e1dfdb] transition-colors"
        >
          <UserIcon className="w-5 h-5 text-[#442a22]" />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
