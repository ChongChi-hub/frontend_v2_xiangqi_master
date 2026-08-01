import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const AuthHeader: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  return (
    <header className="w-full bg-[#f7f5f0]/90 backdrop-blur-md border-b border-[#e8e3d9] px-8 py-4 flex items-center justify-between z-30 sticky top-0">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <span className="text-2xl font-serif font-black tracking-tight text-[#361e15] group-hover:text-[#4a2c20] transition-colors">
          Xiangqi Master
        </span>
      </Link>

      {/* Nav Menu */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
        <Link to="/dashboard" className="text-[#361e15] font-bold hover:text-[#4a2c20] transition-colors">
          Sảnh đấu
        </Link>
        <Link to="/pve" className="hover:text-[#361e15] transition-colors flex items-center gap-1">
          Đấu với AI
        </Link>
        <Link to="/home" className="hover:text-[#361e15] transition-colors">
          Trang chủ
        </Link>
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 text-xs font-semibold">
        <Link
          to="/login"
          className={
            isLoginPage
              ? 'bg-[#361e15] text-white px-5 py-2.5 rounded-lg shadow-sm transition-all'
              : 'text-[#361e15] hover:bg-[#361e15]/10 px-5 py-2.5 rounded-lg border border-[#361e15]/20 transition-all'
          }
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className={
            isRegisterPage || (!isLoginPage && !isRegisterPage)
              ? 'bg-[#361e15] text-white px-5 py-2.5 rounded-lg shadow-sm transition-all'
              : 'text-[#361e15] hover:bg-[#361e15]/10 px-5 py-2.5 rounded-lg border border-[#361e15]/20 transition-all'
          }
        >
          Register
        </Link>
      </div>
    </header>
  );
};
