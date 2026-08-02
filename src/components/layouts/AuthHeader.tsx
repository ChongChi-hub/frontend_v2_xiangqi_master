import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown, message, type MenuProps } from 'antd';
import { Users, Bell, User as UserIcon, LogOut, Shield, Inbox } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { getTitleFromElo } from '@/types/user';

export const AuthHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  const handleLogout = () => {
    logout();
    message.success('Đã đăng xuất thành công');
    navigate('/login');
  };

  const username = user?.username || 'Kỳ Thủ';
  const eloScore = user?.eloScore ?? 1200;
  const userTitle = getTitleFromElo(eloScore);

  const menuItems: MenuProps['items'] = [
    {
      key: 'user-header',
      label: (
        <div className="px-2 py-1.5 border-b border-[#e5e5e5]">
          <p className="font-bold text-[#442a22] font-sans text-sm">{username}</p>
          <p className="text-xs text-[#504441] mt-0.5">{userTitle} ({eloScore} ELO)</p>
        </div>
      ),
      disabled: true,
    },
    {
      key: 'profile',
      icon: <UserIcon className="w-4 h-4 text-[#361e15]" />,
      label: <span className="font-bold font-sans">Hồ sơ cá nhân</span>,
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      danger: true,
      icon: <LogOut className="w-4 h-4" />,
      label: <span className="font-bold font-sans">Đăng xuất</span>,
      onClick: handleLogout,
    },
  ];

  const notificationItems: MenuProps['items'] = [
    {
      key: 'noti-header',
      label: (
        <div className="px-3 py-2 border-b border-[#e5e5e5] flex items-center justify-between min-w-[240px]">
          <span className="font-bold text-[#442a22] font-serif text-sm">Thông báo & Tin nhắn</span>
          <span className="text-[11px] text-[#8d6e63] bg-[#f4efe6] px-2 py-0.5 rounded-full font-semibold">0 mới</span>
        </div>
      ),
      disabled: true,
    },
    {
      key: 'noti-empty',
      label: (
        <div className="py-6 px-4 text-center flex flex-col items-center justify-center gap-2">
          <Inbox className="w-8 h-8 text-[#d4c3be]" />
          <p className="text-xs text-[#7d6e6a] font-sans font-medium">Chưa có thông báo hay tin nhắn nào</p>
        </div>
      ),
      disabled: true,
    },
  ];

  return (
    <header className="w-full bg-[#fcf9f8]/90 backdrop-blur-md border-b border-[#d4c3be] px-4 sm:px-8 md:px-16 py-3 flex items-center justify-between z-30 sticky top-0">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Link to="/home" className="group">
          <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#442a22] group-hover:text-[#5d4037] transition-colors">
            Xiangqi Master
          </span>
        </Link>
      </div>

      {/* Action Icons & Controls */}
      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <>
            <button
              type="button"
              title="Nhóm"
              className="text-[#504441] hover:bg-[#f6f3f2] p-2 rounded-full transition-colors cursor-pointer"
            >
              <Users className="w-5 h-5" />
            </button>

            {/* Notification Bell Dropdown */}
            <Dropdown menu={{ items: notificationItems }} placement="bottomRight" trigger={['click', 'hover']}>
              <button
                type="button"
                title="Thông báo"
                className="text-[#504441] hover:bg-[#f6f3f2] p-2 rounded-full transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full animate-pulse" />
              </button>
            </Dropdown>

            {/* Avatar with Dropdown: Option 1 = Hồ sơ, Option 2 = Đăng xuất */}
            <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click', 'hover']}>
              <div
                title={`Tài khoản: ${username}`}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#e4e2dd] border border-[#d4c3be] hover:bg-[#e1dfdb] transition-colors cursor-pointer shadow-xs"
              >
                <div className="w-8 h-8 rounded-full bg-[#361e15] flex items-center justify-center text-white overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={username} className="w-full h-full object-cover" />
                  ) : (
                    <Shield className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="font-sans text-xs font-bold text-[#442a22] hidden sm:inline">
                  {username}
                </span>
              </div>
            </Dropdown>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={
                isLoginPage
                  ? 'bg-[#361e15] text-white px-4 py-2 rounded-lg shadow-xs transition-all text-xs font-semibold'
                  : 'text-[#361e15] hover:bg-[#361e15]/10 px-4 py-2 rounded-lg border border-[#361e15]/20 transition-all text-xs font-semibold'
              }
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className={
                isRegisterPage || (!isLoginPage && !isRegisterPage)
                  ? 'bg-[#361e15] text-white px-4 py-2 rounded-lg shadow-xs transition-all text-xs font-semibold'
                  : 'text-[#361e15] hover:bg-[#361e15]/10 px-4 py-2 rounded-lg border border-[#361e15]/20 transition-all text-xs font-semibold'
              }
            >
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default AuthHeader;
