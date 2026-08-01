import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Users, Bell, User as UserIcon, LogOut } from 'lucide-react';
import { message } from 'antd';

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
              onClick={() => navigate('/dashboard')}
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
              onClick={() => navigate('/dashboard')}
              title={user.username || 'Sảnh đấu'}
              className="w-9 h-9 rounded-full bg-[#e4e2dd] border border-[#d4c3be] flex items-center justify-center cursor-pointer hover:bg-[#e1dfdb] transition-colors"
            >
              <UserIcon className="w-5 h-5 text-[#442a22]" />
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="text-[#504441] hover:bg-[#ffdad6]/50 hover:text-[#ba1a1a] p-2 rounded-full transition-colors cursor-pointer ml-1"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => navigate('/login')}
              title="Nhóm"
              className="text-[#504441] hover:bg-[#f6f3f2] p-2 rounded-full transition-colors cursor-pointer"
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              title="Thông báo"
              className="text-[#504441] hover:bg-[#f6f3f2] p-2 rounded-full transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full animate-pulse" />
            </button>

            <Link
              to="/login"
              className={
                isLoginPage
                  ? 'bg-[#361e15] text-white px-4 py-2 rounded-lg shadow-xs transition-all text-xs font-semibold'
                  : 'text-[#361e15] hover:bg-[#361e15]/10 px-4 py-2 rounded-lg border border-[#361e15]/20 transition-all text-xs font-semibold'
              }
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className={
                isRegisterPage || (!isLoginPage && !isRegisterPage)
                  ? 'bg-[#361e15] text-white px-4 py-2 rounded-lg shadow-xs transition-all text-xs font-semibold'
                  : 'text-[#361e15] hover:bg-[#361e15]/10 px-4 py-2 rounded-lg border border-[#361e15]/20 transition-all text-xs font-semibold'
              }
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

