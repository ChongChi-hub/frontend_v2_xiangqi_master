import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { getTitleFromElo } from '@/types/user';
import { Gamepad2, Cpu, Lock, History, Trophy, LogOut } from 'lucide-react';
import { message } from 'antd';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    message.success('Đã đăng xuất thành công');
    navigate('/login');
  };

  const username = user?.username || 'Kỳ Thủ';
  const title = getTitleFromElo(user?.eloScore ?? 1850);
  const defaultAvatar =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAVLUPKIj0KjoGE_BZ9ByvSZYW22KVP3THcqzHjv3JxYambXnO8AcIBkMKh5RgxEdUA1XXkZ-wysXcPQYg3NSicB-lluggL3sJo-fZOaqcnRMUXODnfdsXlUbSHXQyMXFKo891lakr9vQzq15IXV_jUfjD57mkQ7W9nTcdmA6l1dr-x7rdgdLx4xwQYI0Hpx0FgBy1JDPjAfbdIwh8XDB2sRGldGY9pj1Z1UHJT05uxV2HA1TVP6Cm2';

  const navItems = [
    {
      label: 'Sảnh đấu',
      path: '/dashboard',
      icon: <Gamepad2 className="w-5 h-5" />,
    },
    {
      label: 'Đấu với AI',
      path: '/pve',
      icon: <Cpu className="w-5 h-5" />,
    },
    {
      label: 'Phòng riêng',
      path: '#private-room',
      icon: <Lock className="w-5 h-5" />,
    },
    {
      label: 'Lịch sử',
      path: '#history',
      icon: <History className="w-5 h-5" />,
    },
    {
      label: 'Xếp hạng',
      path: '#leaderboard',
      icon: <Trophy className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#fcf9f8] border-r border-[#d4c3be] p-4 space-y-4 z-50">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 px-2 py-3">
        <Link to="/dashboard" className="group">
          <h1 className="font-serif text-2xl font-bold text-[#442a22] tracking-tight group-hover:text-[#5d4037] transition-colors">
            Xiangqi Master
          </h1>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/dashboard' && location.pathname === '/');

          return (
            <Link
              key={item.label}
              to={item.path.startsWith('#') ? '#' : item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#5d4037] text-[#d4ada1] font-bold shadow-xs scale-98'
                  : 'text-[#504441] hover:bg-[#e1dfdb]/60 hover:text-[#442a22]'
              }`}
            >
              {item.icon}
              <span className="font-sans">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer in Sidebar */}
      <div className="pt-4 border-t border-[#d4c3be] space-y-2">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full border-2 border-[#442a22] overflow-hidden shrink-0 bg-white shadow-xs">
            <img
              src={defaultAvatar}
              alt={username}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm font-bold text-[#442a22] truncate">
              {username}
            </p>
            <p className="text-xs text-[#504441] truncate">{title}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Đăng xuất"
            className="ml-auto text-[#504441] hover:text-[#ba1a1a] p-1.5 rounded-full hover:bg-[#ffdad6]/50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
